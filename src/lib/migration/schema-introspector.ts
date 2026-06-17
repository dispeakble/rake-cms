/**
 * Schema Introspector.
 *
 * Connects to a legacy WordPress MySQL/MariaDB database, detects
 * the table prefix, maps column types, and prepares migration.
 *
 * Handles SQL dialect differences:
 *  - MySQL backticks → PostgreSQL double-quotes
 *  - AUTO_INCREMENT → SERIAL
 *  - LONGTEXT/BLOB → text
 *  - DATETIME/TIMESTAMP → timestamp
 */

import mysql from "mysql2/promise";

export interface WpTableInfo {
  name: string;
  columns: WpColumnInfo[];
  rowCount: number;
}

export interface WpColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  default: string | null;
  isAutoIncrement: boolean;
  /** Recommended Drizzle-compatible type */
  targetType: string;
}

export interface DbConnectionConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

export interface IntrospectionResult {
  prefix: string;
  tables: WpTableInfo[];
  detectedTables: string[];
  missingTables: string[];
}

const EXPECTED_WP_TABLES = [
  "posts",
  "users",
  "postmeta",
  "terms",
  "term_taxonomy",
  "term_relationships",
  "options",
  "comments",
];

/**
 * Map MySQL column types to cross-dialect compatible types.
 */
function mapColumnType(mysqlType: string): string {
  const type = mysqlType.toLowerCase();

  if (type.includes("bigint")) return "bigint";
  if (type.includes("int") || type.includes("tinyint") || type.includes("smallint") || type.includes("mediumint"))
    return "integer";
  if (type.includes("decimal") || type.includes("float") || type.includes("double"))
    return "numeric";
  if (type.includes("longtext") || type.includes("mediumtext") || type.includes("blob") || type.includes("text"))
    return "text";
  if (type.includes("varchar")) return "varchar";
  if (type.includes("char")) return "varchar";
  if (type.includes("datetime") || type.includes("timestamp"))
    return "timestamp";
  if (type.includes("date")) return "timestamp";
  if (type.includes("tinyint(1)") || type.includes("bool") || type.includes("boolean"))
    return "boolean";
  if (type.includes("enum") || type.includes("set"))
    return "varchar";

  return "text"; // Safe fallback
}

/**
 * Connect to a legacy WordPress database and introspect its schema.
 */
export async function introspectWpDb(
  config: DbConnectionConfig
): Promise<IntrospectionResult> {
  const connection = await mysql.createConnection({
    host: config.host,
    port: config.port,
    user: config.user,
    password: config.password,
    database: config.database,
  });

  // Detect table prefix
  const [tables] = await connection.execute<mysql.RowDataPacket[]>(
    "SHOW TABLES"
  );
  const tableNames = tables.map((t: mysql.RowDataPacket) => Object.values(t)[0] as string);

  // Find prefix by looking for wp_posts
  const postsTable = tableNames.find((name) => name.endsWith("_posts"));
  const prefix = postsTable ? postsTable.replace("_posts", "_") : "wp_";

  console.log(`\n🔍 Detected table prefix: "${prefix}"`);

  const expected = EXPECTED_WP_TABLES.map((t) => `${prefix}${t}`);
  const detected = expected.filter((t) => tableNames.includes(t));
  const missing = expected.filter((t) => !tableNames.includes(t));

  if (missing.length > 0) {
    console.log(`⚠️  Missing tables: ${missing.join(", ")}`);
  }

  // Introspect each detected table
  const tablesInfo: WpTableInfo[] = [];

  for (const tableName of detected) {
    const [columns] = await connection.execute<mysql.RowDataPacket[]>(
      `SHOW COLUMNS FROM \`${tableName}\``
    );

    const [countResult] = await connection.execute<mysql.RowDataPacket[]>(
      `SELECT COUNT(*) as cnt FROM \`${tableName}\``
    );
    const rowCount = countResult[0].cnt as number;

    const columnsInfo: WpColumnInfo[] = (columns as mysql.RowDataPacket[]).map(
      (col: mysql.RowDataPacket) => ({
        name: col.Field as string,
        type: col.Type as string,
        nullable: (col.Null as string) === "YES",
        default: col.Default as string | null,
        isAutoIncrement: (col.Extra as string).includes("auto_increment"),
        targetType: mapColumnType(col.Type as string),
      })
    );

    tablesInfo.push({
      name: tableName,
      columns: columnsInfo,
      rowCount,
    });

    console.log(`  • ${tableName}: ${rowCount} rows, ${columnsInfo.length} columns`);
  }

  await connection.end();

  return {
    prefix,
    tables: tablesInfo,
    detectedTables: detected,
    missingTables: missing,
  };
}

/**
 * Build a type mapping report for the migration log.
 */
export function generateTypeMappingReport(result: IntrospectionResult): string {
  const lines: string[] = [
    "# Database Migration Report",
    `Generated: ${new Date().toISOString()}`,
    `Prefix: ${result.prefix}`,
    "",
    "## Tables",
  ];

  for (const table of result.tables) {
    lines.push(`\n### ${table.name} (${table.rowCount} rows)`);
    lines.push("| Column | MySQL Type | Target Type | Nullable |");
    lines.push("|--------|-----------|-------------|----------|");
    for (const col of table.columns) {
      lines.push(
        `| ${col.name} | ${col.type} | ${col.targetType} | ${col.nullable ? "YES" : "NO"} |`
      );
    }
  }

  if (result.missingTables.length > 0) {
    lines.push("\n## Missing Tables");
    lines.push(
      `The following expected WordPress tables were not found: ${result.missingTables.join(", ")}`
    );
  }

  return lines.join("\n");
}
