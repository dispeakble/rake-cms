<?php
/**
 * Default page template.
 */
get_header();
?>

<div class="container mx-auto max-w-4xl px-4 py-24">
    <?php while (have_posts()) : the_post(); ?>
        <h1 class="text-4xl font-bold gradient-text mb-6"><?php the_title(); ?></h1>
        <div class="prose prose-invert max-w-none">
            <?php the_content(); ?>
        </div>
    <?php endwhile; ?>
</div>

<?php get_footer(); ?>
