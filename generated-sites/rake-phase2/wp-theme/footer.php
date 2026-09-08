</main>
<footer class="relative px-4 py-16 overflow-hidden">
    <!-- Animated Gradient Background -->
    <div class="animated-mesh">
        <div class="mesh-blob"></div>
        <div class="mesh-blob"></div>
        <div class="mesh-blob"></div>
    </div>
    <div class="absolute inset-0 bg-section opacity-50"></div>
    <div class="absolute top-0 left-0 right-0 h-[2px]" style="background:linear-gradient(90deg, transparent, var(--color-gold), var(--color-primary), var(--color-gold), transparent);background-size:200% 100%;animation:gradient 4s linear infinite;"></div>
    <div class="relative z-10 container mx-auto max-w-6xl">
        <div class="grid gap-10 md:grid-cols-4">
            <div class="md:col-span-2">
                <h4 class="mb-4 text-lg font-semibold text-white"><span class="gradient-text-gold">Demo</span></h4>
                <p class="max-w-sm text-sm leading-relaxed text-tertiary">El auténtico rodizio brasileño en Tenerife</p>
                <p class="mt-3 text-xs text-tertiary">📍 Jirón Domeyer 282, Barranco 15063, Peru</p>
                <div class="mt-6 flex gap-4">
                    <!-- Facebook with glow -->
                    <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-tertiary transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(var(--color-gold-rgb),0.3)]" aria-label="Facebook">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                    </a>
                    <!-- Instagram with glow -->
                    <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-tertiary transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(var(--color-gold-rgb),0.3)]" aria-label="Instagram">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
                    </a>
                    <!-- Twitter/X with glow -->
                    <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" class="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm text-tertiary transition-all duration-300 hover:border-white/40 hover:bg-white/10 hover:text-white hover:shadow-[0_0_20px_rgba(var(--color-gold-rgb),0.3)]" aria-label="Twitter">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                    </a>
                </div>
            </div>
            <div>
                <h4 class="mb-4 text-sm font-semibold uppercase tracking-wider text-tertiary">Enlaces</h4>
                <div class="space-y-3 text-sm">
                    <a href="#menu" class="block text-sm text-tertiary transition-all duration-300 hover:text-white hover:translate-x-1">Nuestra Carta</a>
                    <a href="#about" class="block text-sm text-tertiary transition-all duration-300 hover:text-white hover:translate-x-1">Sobre nosotros</a>
                    <a href="#services" class="block text-sm text-tertiary transition-all duration-300 hover:text-white hover:translate-x-1">Qué ofrecemos</a>
                    <a href="#contact" class="block text-sm text-tertiary transition-all duration-300 hover:text-white hover:translate-x-1">Contacto</a>
                </div>
            </div>
        </div>
        <div class="mt-12 border-t border-white/10 pt-8 text-center text-xs text-quaternary leading-relaxed">
            <p>&copy; <?php echo date("Y"); ?> Demo. Todos los derechos reservados.</p>
            <p class="mt-1">Made with ❤️ by <a href="https://alexawebservers.com" target="_blank" rel="noopener noreferrer" class="text-secondary hover:text-white transition-colors">alexawebservers.com</a></p>
        </div>
    </div>
</footer>
</div>
<?php wp_footer(); ?>
</body>
</html>