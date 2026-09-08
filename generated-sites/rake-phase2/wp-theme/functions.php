<?php
/**
 * Demo — Auto-generated WordPress Theme
 * Functions and theme setup. (patched: remove wrong SVG enqueue; load Tailwind CDN for quick layout)
 */

// Theme setup
add_action('after_setup_theme', function () {
    add_theme_support('title-tag');
    add_theme_support('post-thumbnails');
    add_theme_support('custom-logo');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption']);
    add_theme_support('responsive-embeds');
    add_theme_support('align-wide');

    register_nav_menus([
        'primary' => __('Primary Menu', 'rake-cms'),
    ]);
});

// Enqueue styles & scripts
add_action('wp_enqueue_scripts', function () {
    wp_enqueue_style('demo-theme', get_stylesheet_uri(), [], '1.0.0');
    // Enqueue Google Fonts
    wp_enqueue_style('demo-fonts', 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap', [], null);
    // Enqueue theme.js for interactivity
    wp_enqueue_script('demo-theme-js', get_template_directory_uri() . '/assets/js/theme.js', [], '1.0.0', true);
    // Quick temporary: load Tailwind CDN so utility classes render immediately (dev convenience)
    wp_enqueue_script('demo-tailwind', 'https://cdn.tailwindcss.com', [], null, false);
    // NOTE: remove incorrect enqueuing of SVG as a stylesheet (was causing a bad rel)
});
    // Enqueue quick critical CSS for utilities
    wp_enqueue_style('demo-critical', get_template_directory_uri() . '/assets/css/critical.css', [], '1.0.0');
