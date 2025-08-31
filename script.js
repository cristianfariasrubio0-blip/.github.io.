/**
 * Event Listener para DOMContentLoaded
 * ------------------------------------
 * Se utiliza para asegurar que todo el script se ejecute únicamente después de que el
 * árbol DOM del HTML haya sido completamente cargado y parseado. Esto previene errores
 * que podrían ocurrir si intentamos seleccionar elementos que aún no existen.
 */
document.addEventListener('DOMContentLoaded', () => {

    // --- NAVEGACIÓN CON EFECTO DE SCROLL ---
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });


    // --- EFECTO DE MÁQUINA DE ESCRIBIR (TYPING) ---
    function initTypingEffect(element, words, wait = 2000) {
        let txt = '';
        let wordIndex = 0;
        let isDeleting = false;

        function type() {
            const currentWord = words[wordIndex];
            if (isDeleting) {
                txt = currentWord.substring(0, txt.length - 1);
            } else {
                txt = currentWord.substring(0, txt.length + 1);
            }
            element.innerHTML = `<span class="txt">${txt}</span>`;
            let typeSpeed = 200;
            if (isDeleting) {
                typeSpeed /= 2;
            }
            if (!isDeleting && txt === currentWord) {
                typeSpeed = wait;
                isDeleting = true;
            } else if (isDeleting && txt === '') {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
                typeSpeed = 500;
            }
            setTimeout(type, typeSpeed);
        }
        type();
    }

    const typingElement = document.getElementById('typing-effect');
    const wordsToType = ["Data Scientist", "Ingeniero en Automatización", "Traductor de Datos a Decisiones"];
    if (typingElement) {
        initTypingEffect(typingElement, wordsToType);
    }


    // --- CARGA DINÁMICA DE PROYECTOS ---
    /**
     * Carga los proyectos desde un archivo JSON y los muestra en la página.
     * Esta función hace el sitio escalable. Para añadir nuevos proyectos,
     * solo es necesario modificar el archivo projects.json.
     */
    async function loadProjects() {
        try {
            const response = await fetch('projects.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const projects = await response.json();
            const projectsGrid = document.querySelector('.projects-grid');
            
            if (projects.length === 0) {
                projectsGrid.innerHTML = '<p>Próximamente, más proyectos...</p>';
                return;
            }

            projectsGrid.innerHTML = ''; // Limpiar el contenedor
            projects.forEach(project => {
                const projectCard = document.createElement('article');
                projectCard.className = 'project-card reveal';

                // Usamos atributos data-* para pasar la información completa al modal
                projectCard.dataset.title = project.title;
                projectCard.dataset.description = project.description_long;
                projectCard.dataset.image = project.image;
                projectCard.dataset.github = project.github;
                projectCard.dataset.demo = project.demo;

                projectCard.innerHTML = `
                    <div class="card-content">
                        <h3>${project.title}</h3>
                        <p>${project.description_short}</p>
                        <div class="tags">
                            ${project.tags.map(tag => `<span>${tag}</span>`).join('')}
                        </div>
                        <button class="btn-details">Ver Más Detalles</button>
                    </div>
                `;
                projectsGrid.appendChild(projectCard);
            });
            
            // Una vez cargados los proyectos, reiniciamos la lógica del modal y de reveal
            initModalLogic();
            initRevealOnScroll();

        } catch (error) {
            console.error("No se pudieron cargar los proyectos:", error);
            const projectsGrid = document.querySelector('.projects-grid');
            projectsGrid.innerHTML = '<p>Error al cargar los proyectos. Intente de nuevo más tarde.</p>';
        }
    }

    loadProjects(); // Llamamos a la función para que se ejecute al cargar la página


    // --- LÓGICA DEL MODAL DE PROYECTOS (MODIFICADA) ---
    /**
     * Inicializa los event listeners para las tarjetas de proyecto.
     * Se llama después de que los proyectos son cargados dinámicamente.
     */
    function initModalLogic() {
        const modal = document.getElementById('project-modal');
        const closeModalBtn = document.getElementById('close-modal');
        const projectCards = document.querySelectorAll('.project-card');

        projectCards.forEach(card => {
            card.addEventListener('click', () => {
                document.getElementById('modal-title').textContent = card.dataset.title;
                document.getElementById('modal-description').textContent = card.dataset.description;
                document.getElementById('modal-img').src = card.dataset.image;
                document.getElementById('modal-github').href = card.dataset.github;
                document.getElementById('modal-demo').href = card.dataset.demo;
                modal.classList.add('show');
            });
        });

        closeModalBtn.addEventListener('click', () => modal.classList.remove('show'));
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.classList.remove('show');
        });
    }


    // --- RESALTADO DE ENLACE DE NAVEGACIÓN ACTIVO ---
    const sections = document.querySelectorAll('.section');
    const navLinks = document.querySelectorAll('nav ul li a');
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.6 };
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href').substring(1) === entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, observerOptions);
    sections.forEach(section => sectionObserver.observe(section));


    // --- ANIMACIÓN DE APARICIÓN AL HACER SCROLL (MODIFICADA) ---
    /**
     * Inicializa el Intersection Observer para los elementos con la clase .reveal.
     * Se llama después de que los proyectos son cargados dinámicamente.
     */
    function initRevealOnScroll() {
        const revealElements = document.querySelectorAll('.reveal');
        const revealObserverOptions = { threshold: 0.15 };
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, revealObserverOptions);
        revealElements.forEach(el => revealObserver.observe(el));
    }
    
    // Se llama una vez para los elementos estáticos de la página
    initRevealOnScroll();
});
