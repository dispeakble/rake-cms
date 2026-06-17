/**
 * Drizzle schema barrel export.
 * All table schemas are re-exported from here.
 */
export { posts } from "./posts";
export type { Post, NewPost } from "./posts";

export { users } from "./users";
export type { User, NewUser } from "./users";

export { postmeta } from "./postmeta";
export type { PostMeta, NewPostMeta } from "./postmeta";

export { terms } from "./terms";
export type { Term, NewTerm } from "./terms";

export { termTaxonomy } from "./term-taxonomy";
export type { TermTaxonomy, NewTermTaxonomy } from "./term-taxonomy";

export { termRelationships } from "./term-relationships";
export type { TermRelationship, NewTermRelationship } from "./term-relationships";

export { options } from "./options";
export type { Option, NewOption } from "./options";

export { comments } from "./comments";
export type { Comment, NewComment } from "./comments";
