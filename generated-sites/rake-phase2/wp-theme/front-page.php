<?php
/**
 * Front Page — renders all sections on one page.
 * Template Name: Front Page
 */

get_header();
?>

<!-- ═══════════ HERO ═══════════ -->
<section class="relative flex h-[90vh] min-h-[600px] items-center justify-center overflow-hidden pt-20 px-6" id="hero">
    <!-- Animated gradient background -->
    <div class="absolute inset-0 pointer-events-none animated-gradient"></div>

    <!-- Floating glow particles -->
    <div class="floating-particle" style="top:10%;left:5%;width:300px;height:300px;background:radial-gradient(circle, rgba(var(--color-gold-rgb),0.15), transparent 70%);--particle-duration:6s;--particle-delay:0s;"></div>
    <div class="floating-particle" style="top:60%;right:10%;width:250px;height:250px;background:radial-gradient(circle, rgba(var(--color-gold-rgb),0.10), transparent 70%);--particle-duration:8s;--particle-delay:1s;"></div>
    <div class="floating-particle" style="bottom:15%;left:40%;width:200px;height:200px;background:radial-gradient(circle, rgba(var(--color-primary-rgb),0.12), transparent 70%);--particle-duration:7s;--particle-delay:0.5s;"></div>

    <!-- Hero Carousel Background -->
    <div class="hero-carousel absolute inset-0">
        <?php
        // Priority 1: Generated carousel slides
        $hero_files = glob(get_template_directory() . '/assets/images/generated/slide*.svg');
        if (empty($hero_files)) {
            // Priority 2: Website scraped images
            $hero_files = glob(get_template_directory() . '/assets/images/website-*.{jpeg,jpg,png,webp,svg}');
            if (empty($hero_files)) {
                // Fallback: Unsplash SVGs (max 3)
                $hero_files = glob(get_template_directory() . '/assets/images/unsplash-*.svg');
                if (!empty($hero_files)) {
                    sort($hero_files);
                    $hero_files = array_slice($hero_files, 0, 3);
                }
            }
        }
        if (!empty($hero_files)):
            foreach ($hero_files as $idx => $hf):
                $active_class = $idx === 0 ? 'active' : '';
        ?>
        <div class="slide <?php echo $active_class; ?>" data-index="<?php echo $idx; ?>">
            <div class="absolute inset-0" style="background-image:url(<?php echo str_replace(get_template_directory(), get_template_directory_uri(), $hf); ?>);background-size:cover;background-position:center;"></div>
            <div class="absolute inset-0 bg-black/40"></div>
        </div>
        <?php endforeach; ?>
        <!-- Carousel Controls -->
        <button class="carousel-prev absolute left-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300" aria-label="Previous slide">&lsaquo;</button>
        <button class="carousel-next absolute right-4 top-1/2 z-20 -translate-y-1/2 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300" aria-label="Next slide">&rsaquo;</button>
        <?php endif; ?>
    </div>

    <!-- Hero Content -->
    <div class="relative z-10 mx-auto max-w-4xl text-center text-white pb-36 reveal fade-up">
        <div class="mb-6 inline-block">
            <span class="inline-block rounded-full border border-white/30 bg-white/10 px-6 py-2 text-xs uppercase tracking-[0.3em] text-white backdrop-blur-sm">El auténtico rodizio brasileño en Tenerife</span>
        </div>
        <h1 class="mb-4 text-4xl font-black tracking-tight md:text-5xl lg:text-6xl leading-tight gradient-text">
            El auténtico rodizio brasileño en Tenerife
        </h1>
        <p class="mx-auto mb-8 max-w-2xl text-base text-white/70 md:text-lg">
            Demo — El auténtico rodizio brasileño en Tenerife
        </p>
        <div class="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href="#contact" class="shimmer-btn-gold inline-flex items-center rounded-xl bg-gradient-to-r from-[#584838] to-[#c8c8c8] px-10 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105">
                Reserva tu Mesa
            </a>
            <a href="#menu" class="inline-flex items-center rounded-xl border-2 border-white/30 px-10 py-4 font-bold text-white transition-all duration-300 hover:border-[#c8c8c8] hover:bg-white/10 hover:scale-105">
                Ver Menú
            </a>
        </div>
    </div>
</section>

<!-- ═══════════ ABOUT ═══════════ -->
<section id="about" class="relative px-6 py-32 overflow-hidden reveal fade-up">
    <div class="absolute inset-0 bg-section opacity-90"></div>
    <div class="relative z-10 container mx-auto max-w-6xl">
        <div class="grid items-center gap-16 md:grid-cols-2">
            <div>
                <span class="mb-4 block text-xs uppercase tracking-[0.3em] text-secondary/60">El auténtico rodizio brasileño en Tenerife</span>
                <h2 class="mb-6 text-3xl font-bold md:text-4xl gradient-text">Sobre Demo</h2>
                <p class="mb-4 leading-relaxed text-secondary">Demo es un destino gastronómico de referencia en Jirón Domeyer 282. Nos enorgullecemos de servir platos frescos y llenos de sabor elaborados con ingredientes de origen local. Nuestro ambiente acogedor y nuestro equipo hacen que cada visita sea especial.</p>
                <p class="mb-4 leading-relaxed text-secondary">Ya sea para una comida informal, una cena romántica o una celebración especial en Jirón Domeyer 282, nuestro equipo está aquí para hacer de su visita una experiencia inolvidable.</p>

                <!-- About Stats -->
                <div class="mt-8 grid grid-cols-3 gap-4">
                    
                    <div class="stat-card">
                        <div class="animated-counter stat-number" data-target="15+">15+</div>
                        <div class="stat-label">Años de Experiencia</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="animated-counter stat-number" data-target="500+">500+</div>
                        <div class="stat-label">Platos Servidos</div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="animated-counter stat-number" data-target="98">98%</div>
                        <div class="stat-label">Clientes Satisfechos</div>
                    </div>
                </div>
            </div>
            <div>
                <div class="relative overflow-hidden rounded-2xl">
                    <img src="<?php echo get_template_directory_uri(); ?>/assets/images/maps-1788801826136-5q1wya.jpeg" alt="About Demo" class="h-full w-full object-cover" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22800%22%20height%3D%22600%22%20fill%3D%22%23c8c8c8%22%3E%3Crect%20width%3D%22800%22%20height%3D%22600%22%2F%3E%3Ctext%20x%3D%22400%22%20y%3D%22300%22%20text-anchor%3D%22middle%22%20fill%3D%22white%22%20font-size%3D%2224%22%3EDemo%3C%2Ftext%3E%3C%2Fsvg%3E'" />
                </div>
            </div>
        </div>
    </div>
</section>

<!-- ═══════════ SERVICES ═══════════ -->
<section id="services" class="relative px-6 py-32 overflow-hidden reveal fade-up">
    <div class="absolute inset-0 bg-section"></div>
    <div class="relative z-10 container mx-auto max-w-6xl">
        <div class="mb-12 text-center">
            <span class="mb-4 block text-xs uppercase tracking-[0.3em] text-secondary/60">Demo</span>
            <h2 class="text-3xl font-bold text-white md:text-4xl gradient-text">Nuestros servicios</h2>
        </div>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div class="rounded-2xl p-[1px] glow-card group">
    <div class="relative rounded-2xl bg-card-inner p-10 h-full transition-all duration-300 hover:scale-[1.02]">
        <span class="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" style="color:var(--color-gold);border:1px solid rgba(var(--color-gold-rgb),0.3);">01</span>
        <h3 class="mb-3 text-xl font-bold text-heading">Pescados y Mariscos</h3>
        <p class="text-sm leading-relaxed text-secondary">Los mejores pescados frescos del Atlántico, seleccionados diariamente. Nuestra lubina salvaje, el rodaballo y el pulpo a la brasa son los favoritos de nuestros comensales.</p>
    </div>
</div>
            <div class="rounded-2xl p-[1px] glow-card group">
    <div class="relative rounded-2xl bg-card-inner p-10 h-full transition-all duration-300 hover:scale-[1.02]">
        <span class="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" style="color:var(--color-gold);border:1px solid rgba(var(--color-gold-rgb),0.3);">02</span>
        <h3 class="mb-3 text-xl font-bold text-heading">Arroces y Paellas</h3>
        <p class="text-sm leading-relaxed text-secondary">Arroces mediterráneos cocinados a fuego lento con caldos naturales. Nuestra paella de mariscos y el arroz meloso de bogavante son auténticas obras maestras.</p>
    </div>
</div>
            <div class="rounded-2xl p-[1px] glow-card group">
    <div class="relative rounded-2xl bg-card-inner p-10 h-full transition-all duration-300 hover:scale-[1.02]">
        <span class="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" style="color:var(--color-gold);border:1px solid rgba(var(--color-gold-rgb),0.3);">03</span>
        <h3 class="mb-3 text-xl font-bold text-heading">Carnes Seleccionadas</h3>
        <p class="text-sm leading-relaxed text-secondary">Cortes de carne de primera calidad, desde nuestro solomillo de ternera gallega hasta el cochinillo confitado.</p>
    </div>
</div>
            <div class="rounded-2xl p-[1px] glow-card group">
    <div class="relative rounded-2xl bg-card-inner p-10 h-full transition-all duration-300 hover:scale-[1.02]">
        <span class="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" style="color:var(--color-gold);border:1px solid rgba(var(--color-gold-rgb),0.3);">04</span>
        <h3 class="mb-3 text-xl font-bold text-heading">Ensaladas y Entrantes</h3>
        <p class="text-sm leading-relaxed text-secondary">Entrantes mediterráneos que despiertan el apetito: tartar de atún rojo, burrata con tomates heirloom y carpaccio de calabacín.</p>
    </div>
</div>
            <div class="rounded-2xl p-[1px] glow-card group">
    <div class="relative rounded-2xl bg-card-inner p-10 h-full transition-all duration-300 hover:scale-[1.02]">
        <span class="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" style="color:var(--color-gold);border:1px solid rgba(var(--color-gold-rgb),0.3);">05</span>
        <h3 class="mb-3 text-xl font-bold text-heading">Postres Caseros</h3>
        <p class="text-sm leading-relaxed text-secondary">Nuestra repostería casera incluye tiramisú tradicional, tarta de queso y el exquisito coulant de chocolate belga.</p>
    </div>
</div>
            <div class="rounded-2xl p-[1px] glow-card group">
    <div class="relative rounded-2xl bg-card-inner p-10 h-full transition-all duration-300 hover:scale-[1.02]">
        <span class="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold" style="color:var(--color-gold);border:1px solid rgba(var(--color-gold-rgb),0.3);">06</span>
        <h3 class="mb-3 text-xl font-bold text-heading">Vinos y Cócteles</h3>
        <p class="text-sm leading-relaxed text-secondary">Carta de vinos con más de 50 referencias nacionales e internacionales, con especial atención a los caldos canarios.</p>
    </div>
</div>
        </div>
    </div>
</section>

<!-- ═══════════ REVIEWS ═══════════ -->
<section id="reviews" class="relative px-6 py-32 overflow-hidden reveal fade-up">
    <div class="absolute inset-0 bg-section"></div>
    <div class="relative z-10 container mx-auto max-w-6xl">
        <div class="mb-12 text-center">
            <span class="mb-4 block text-xs uppercase tracking-[0.3em] text-secondary/60">Testimonials</span>
            <h2 class="text-3xl font-bold text-white md:text-4xl gradient-text">Lo que dicen nuestros clientes</h2>
        </div>
        <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div class="relative rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm hover-lift hover:border-white/30 group">
    <!-- SVG Quote Icon -->
    <div class="absolute -top-3 -left-3 text-4xl text-white/10 select-none leading-none">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
    </div>
    <div class="flex gap-1"><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span></div>
    <p class="mt-3 text-sm leading-relaxed text-secondary relative z-10">&ldquo;Comida excelente y atención inmejorable. Los platos estaban deliciosos y el ambiente muy agradable. Sin duda repetiremos la experiencia.&rdquo;</p>
    <div class="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-tertiary">
        <span class="font-medium text-heading">&mdash; María G.</span>
        <span class="font-semibold" style="color:var(--color-gold);">Google</span>
    </div>
</div>
            <div class="relative rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm hover-lift hover:border-white/30 group">
    <!-- SVG Quote Icon -->
    <div class="absolute -top-3 -left-3 text-4xl text-white/10 select-none leading-none">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
    </div>
    <div class="flex gap-1"><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span></div>
    <p class="mt-3 text-sm leading-relaxed text-secondary relative z-10">&ldquo;Buena relación calidad-precio. El servicio fue rápido y profesional. Los postres caseros son espectaculares. Muy recomendable.&rdquo;</p>
    <div class="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-tertiary">
        <span class="font-medium text-heading">&mdash; Carlos R.</span>
        <span class="font-semibold" style="color:var(--color-gold);">Tripadvisor</span>
    </div>
</div>
            <div class="relative rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm hover-lift hover:border-white/30 group">
    <!-- SVG Quote Icon -->
    <div class="absolute -top-3 -left-3 text-4xl text-white/10 select-none leading-none">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
    </div>
    <div class="flex gap-1"><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span></div>
    <p class="mt-3 text-sm leading-relaxed text-secondary relative z-10">&ldquo;Hemos ido varias veces y nunca defrauda. La calidad de la comida es constante y el personal siempre es amable. Un lugar perfecto para cualquier ocasión.&rdquo;</p>
    <div class="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-tertiary">
        <span class="font-medium text-heading">&mdash; Ana &amp; Pedro</span>
        <span class="font-semibold" style="color:var(--color-gold);">Google</span>
    </div>
</div>
            <div class="relative rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm hover-lift hover:border-white/30 group">
    <!-- SVG Quote Icon -->
    <div class="absolute -top-3 -left-3 text-4xl text-white/10 select-none leading-none">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
    </div>
    <div class="flex gap-1"><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span></div>
    <p class="mt-3 text-sm leading-relaxed text-secondary relative z-10">&ldquo;Great food and amazing atmosphere! The service was top-notch and the portions were generous. Highly recommended for anyone visiting the area.&rdquo;</p>
    <div class="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-tertiary">
        <span class="font-medium text-heading">&mdash; James T.</span>
        <span class="font-semibold" style="color:var(--color-gold);">Tripadvisor</span>
    </div>
</div>
            <div class="relative rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm hover-lift hover:border-white/30 group">
    <!-- SVG Quote Icon -->
    <div class="absolute -top-3 -left-3 text-4xl text-white/10 select-none leading-none">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
    </div>
    <div class="flex gap-1"><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="text-lg text-gray-600">☆</span></div>
    <p class="mt-3 text-sm leading-relaxed text-secondary relative z-10">&ldquo;Un descubrimiento maravilloso. La comida es increíble y el trato al cliente es de primera. Los postres son caseros y deliciosos. Volveremos pronto.&rdquo;</p>
    <div class="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-tertiary">
        <span class="font-medium text-heading">&mdash; Laura S.</span>
        <span class="font-semibold" style="color:var(--color-gold);">Restaurant Guru</span>
    </div>
</div>
            <div class="relative rounded-xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm hover-lift hover:border-white/30 group">
    <!-- SVG Quote Icon -->
    <div class="absolute -top-3 -left-3 text-4xl text-white/10 select-none leading-none">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
    </div>
    <div class="flex gap-1"><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span><span class="sparkle-star text-lg">★</span></div>
    <p class="mt-3 text-sm leading-relaxed text-secondary relative z-10">&ldquo;Ambiente acogedor y comida deliciosa. Probamos varios platos y todos estaban espectaculares. El personal muy atento y la relación calidad-precio excelente.&rdquo;</p>
    <div class="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs text-tertiary">
        <span class="font-medium text-heading">&mdash; David M.</span>
        <span class="font-semibold" style="color:var(--color-gold);">Google</span>
    </div>
</div>
        </div>
    </div>
</section>

<!-- ═══════════ CONTACT ═══════════ -->
<section id="contact" class="relative px-6 py-32 overflow-hidden reveal fade-up">
    <div class="absolute inset-0 bg-section"></div>
    <div class="relative z-10 container mx-auto max-w-6xl">
        <div class="mb-14 text-center">
            <span class="mb-4 block text-xs uppercase tracking-[0.3em] text-secondary/60">Contacto</span>
            <h2 class="text-3xl font-bold text-white md:text-4xl gradient-text">Contacto</h2>
            <p class="mx-auto mt-3 max-w-xl text-tertiary">Demo</p>
        </div>
        <div class="grid gap-10 md:grid-cols-2">
            <div class="space-y-8">
    <div class="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm hover-lift">
        <h3 class="mb-4 text-lg font-bold text-heading"><span class="text-secondary">📍</span> Demo</h3>
        <div class="space-y-3 text-sm text-secondary">
            <div class="flex items-start gap-3"><span>📍</span><span>Jirón Domeyer 282, Barranco 15063, Peru</span></div>
            <div class="flex items-start gap-3"><span>📞</span><a href="tel:+51 970 899 418" class="transition hover:underline" style="color:var(--color-gold);">+51 970 899 418</a></div>
            
        </div>
    </div>
    <div class="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm overflow-hidden hover-lift">
        <iframe title="Demo - Location" src="https://www.google.com/maps/embed/v1/place?key=AIzaSyAzSNn342NHMLnqCAhyBd14PMckXJ0IZXc&q=-12.147868299999999,-77.0227386&zoom=15" width="100%" height="300" style="border:0;border-radius:12px" loading="lazy" allowfullscreen></iframe>
        <p class="mt-2 text-center text-[10px] text-quaternary"><a href="https://www.google.com/maps?q=-12.147868299999999,-77.0227386&z=15" target="_blank" rel="noopener noreferrer" class="text-secondary hover:underline">View on Google Maps</a></p>
    </div>
</div>
            <div class="rounded-2xl border border-white/10 bg-white/5 p-10 backdrop-blur-sm hover-lift">
    <h3 class="mb-6 text-lg font-semibold text-heading">Envíanos un mensaje</h3>
    <form class="space-y-5" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" method="post">
        <?php wp_nonce_field('rake_cms_contact', 'contact_nonce'); ?>
        <input type="hidden" name="action" value="rake_cms_contact_form">
        <div>
            <label class="mb-1.5 block text-sm font-medium text-secondary">Nombre</label>
            <input type="text" name="first_name" placeholder="Su nombre" class="w-full rounded-lg border border-white/10 bg-primary/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-secondary focus:outline-none focus:ring-[3px] focus:ring-secondary/20" required>
        </div>
        <div>
            <label class="mb-1.5 block text-sm font-medium text-secondary">Apellido</label>
            <input type="text" name="last_name" placeholder="Su apellido" class="w-full rounded-lg border border-white/10 bg-primary/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-secondary focus:outline-none focus:ring-[3px] focus:ring-secondary/20" required>
        </div>
        <div>
            <label class="mb-1.5 block text-sm font-medium text-secondary">Correo electrónico</label>
            <input type="email" name="email" placeholder="Su correo electrónico" class="w-full rounded-lg border border-white/10 bg-primary/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-secondary focus:outline-none focus:ring-[3px] focus:ring-secondary/20" required>
        </div>
        <div>
            <label class="mb-1.5 block text-sm font-medium text-secondary">Teléfono</label>
            <input type="tel" name="phone" placeholder="Su teléfono" class="w-full rounded-lg border border-white/10 bg-primary/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-secondary focus:outline-none focus:ring-[3px] focus:ring-secondary/20">
        </div>
        <div>
            <label class="mb-1.5 block text-sm font-medium text-secondary">Mensaje</label>
            <textarea name="message" placeholder="Por favor, deje su mensaje aquí ..." rows="4" class="w-full rounded-lg border border-white/10 bg-primary/80 px-4 py-3 text-sm text-white placeholder-white/60 transition-all duration-300 focus:border-secondary focus:outline-none focus:ring-[3px] focus:ring-secondary/20" required></textarea>
        </div>
        <!-- reCAPTCHA Container -->
        <div class="g-recaptcha" data-sitekey="YOUR_RECAPTCHA_SITE_KEY" style="border:1px solid rgba(var(--color-gold-rgb),0.15);border-radius:8px;padding:12px;background:rgba(0,0,0,0.2);"></div>
        <button type="submit" class="pulse-btn shimmer-btn-gold w-full rounded-lg bg-gradient-to-r from-[#584838] via-[#c8c8c8] to-[#584838] px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-300 hover:scale-105">
            Enviar
        </button>
    </form>
</div>
        </div>
    </div>
</section>

<?php get_footer(); ?>
