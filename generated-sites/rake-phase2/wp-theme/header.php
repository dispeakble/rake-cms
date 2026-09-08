<!DOCTYPE html>
<html <?php language_attributes(); ?> class="dark">
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <?php wp_head(); ?>
    <link rel="icon" href="<?php echo esc_url(get_template_directory_uri()); ?>/assets/images/generated/logo.svg" sizes="any" type="image/svg+xml">
    <style>
        html.dark { color-scheme: dark; }
        .dark body { background: var(--color-bg-page); color: var(--color-text-page); }
    </style>
</head>
<body <?php body_class('antialiased font-sans'); ?>>
<?php wp_body_open(); ?>
<div class="flex min-h-screen flex-col bg-page text-page">
<header class="fixed top-0 left-0 right-0 z-50">
    <div class="border-b border-white/30 bg-header backdrop-blur-2xl shadow-lg shadow-black/5">
        <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
            <!-- Logo (left) -->
            <a class="flex-shrink-0" href="<?php echo esc_url(home_url('/')); ?>">
                <img src="<?php echo get_template_directory_uri(); ?>/assets/images/generated/logo.svg" alt="Demo" class="h-8 w-auto" onerror="this.style.display='none'" loading="eager">
            </a>
            <!-- Desktop Navigation -->
            <nav class="hidden items-center gap-3 md:flex">
                <li><a href="#about" class="nav-link">Sobre nosotros</a></li>
            <li><a href="#menu" class="nav-link">Nuestra Carta</a></li>
            <li><a href="#services" class="nav-link">Servicios</a></li>
            <li><a href="#reviews" class="nav-link">Opiniones</a></li>
            <li><a href="#contact" class="nav-link">Contacto</a></li>
            </nav>
            <!-- Right end: Lang toggle + Theme toggle + Hamburger -->
            <div class="flex items-center gap-2">
                <!-- Language Toggle -->
                <div class="relative" id="lang-toggle-container">
                    <button id="lang-toggle" class="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-xs font-bold text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10" aria-label="Cambiar idioma">
                        ES
                    </button>
                    <div id="lang-dropdown" class="absolute right-0 top-full mt-2 hidden w-28 rounded-lg border border-white/10 bg-black/90 p-1 backdrop-blur-xl shadow-lg" style="z-index:100;">
                        <a href="#" class="block rounded-md px-3 py-2 text-xs text-white transition hover:bg-white/10 font-bold" data-lang="es">Español</a>
                        <a href="#" class="block rounded-md px-3 py-2 text-xs text-white transition hover:bg-white/10 " data-lang="en">English</a>
                    </div>
                </div>
                <!-- Theme Toggle -->
                <button id="theme-toggle" class="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-white/5 text-sm text-white transition-all duration-300 hover:border-white/40 hover:bg-white/10" aria-label="Cambiar tema">
                    <span class="theme-icon">🌙</span>
                </button>
                <!-- Mobile Hamburger (animated) -->
                <button class="relative flex h-10 w-10 flex-col items-center justify-center text-white md:hidden" id="mobile-menu-toggle" aria-label="Abrir menú">
                    <span class="block h-0.5 w-6 bg-white rounded-full transition-all duration-300 origin-center hamburger-line-1"></span>
                    <span class="block h-0.5 w-6 bg-white rounded-full transition-all duration-300 my-1 hamburger-line-2"></span>
                    <span class="block h-0.5 w-6 bg-white rounded-full transition-all duration-300 origin-center hamburger-line-3"></span>
                </button>
            </div>
        </div>
        <!-- Mobile Menu Panel -->
        <div id="mobile-menu" class="hidden border-t border-white/10 bg-header backdrop-blur-2xl md:hidden">
            <nav class="flex flex-col gap-1 px-4 py-4">
                <a href="#about" class="rounded-lg px-3 py-2.5 text-sm text-white transition hover:bg-white/10">Sobre nosotros</a>
                <a href="#menu" class="rounded-lg px-3 py-2.5 text-sm text-white transition hover:bg-white/10">Nuestra Carta</a>
                <a href="#services" class="rounded-lg px-3 py-2.5 text-sm text-white transition hover:bg-white/10">Servicios</a>
                <a href="#reviews" class="rounded-lg px-3 py-2.5 text-sm text-white transition hover:bg-white/10">Opiniones</a>
                <a href="#contact" class="rounded-lg px-3 py-2.5 text-sm text-white transition hover:bg-white/10">Contacto</a>
            </nav>
        </div>
    </div>
</header>
<main class="flex-1">
