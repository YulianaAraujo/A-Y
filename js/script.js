document.addEventListener('DOMContentLoaded', () => {
    // Elementos del login
    const dayInput = document.getElementById('day-input');
    const monthInput = document.getElementById('month-input');
    const yearInput = document.getElementById('year-input');
    const lockImage = document.getElementById('lock-image');
    const overlay = document.getElementById('transition-overlay');
    const loginSection = document.getElementById('login-section');

    // Elementos del webtoon
    const webtoonSection = document.getElementById('webtoon-section');
    const webtoonContainer = document.getElementById('webtoon-container');
    const gallerySection = document.getElementById('gallery-section');
    const modal = document.getElementById('modal');
    const closeModalBtn = document.getElementById('close-modal');

    // Valores correctos
    const correctDay = 30;
    const correctMonth = 11;
    const correctYear = 20;

    // Variables para controlar el personaje y música
    let characterPosition = 30;
    let scrollActive = false;
    let currentCharacterFrame = 1;
    let characterAnimationInterval = null;
    let isMoving = false;
    let keysPressed = {};
    let movementAnimationId = null;
    let scrollTimeout = null;
    let lastProcessTime = 0;
    let backgroundMusic = null;
    let button1Clicked = false; // Rastrear si el botón 1 fue clickeado

    // Función para mostrar notificación toast
    function showToast(message, type = 'error') {
        const toast = document.createElement('div');
        toast.style.position = 'fixed';
        toast.style.top = '20px';
        toast.style.left = '50%';
        toast.style.transform = 'translateX(-50%)';
        toast.style.backgroundColor = type === 'error' ? '#ff4444' : '#44ff44';
        toast.style.color = 'white';
        toast.style.padding = '15px 30px';
        toast.style.borderRadius = '5px';
        toast.style.fontSize = '16px';
        toast.style.zIndex = '9999';
        toast.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        toast.style.animation = 'slideDown 0.3s ease-out';
        toast.textContent = message;
        
        document.body.appendChild(toast);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            toast.style.animation = 'slideUp 0.3s ease-out';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Función para cargar imágenes del webtoon
    function loadWebtoon() {
        const totalImages = 18;
        
        for (let i = 0; i <= totalImages; i++) {
            const img = document.createElement('img');
            img.src = `assets/webtoon/${i.toString().padStart(2, '0')}.png`;
            img.alt = `Página ${i} del webtoon`;
            img.className = 'webtoon-image';
            img.style.opacity = '1';
            
            webtoonContainer.appendChild(img);

            // Para la imagen 00: reproducir música cuando sea visible
            if (i === 0) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting && !backgroundMusic) {
                            backgroundMusic = new Audio('assets/sounds/background_music.mp3');
                            backgroundMusic.loop = true;
                            backgroundMusic.volume = 0.3;
                            backgroundMusic.play();
                            observer.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(img);
            }

            // Para la imagen 18: Agregar funcionalidad de modal
            if (i === 18) {
                img.style.cursor = 'pointer';
                img.addEventListener('click', () => {
                    modal.classList.remove('hidden');
                    modal.classList.add('active');
                });
            }
        }
    }

    // Función para iniciar webtoon
    function startWebtoon() {
        loadWebtoon();
    }

    // Función para validar inputs
    function checkInputs() {
        const day = parseInt(dayInput.value);
        const month = parseInt(monthInput.value);
        const year = parseInt(yearInput.value);

        if (day === correctDay && month === correctMonth && year === correctYear) {
            const unlockSound = new Audio('assets/sounds/unlock.mp3');
            const inputsContainer = document.querySelector('.inputs-container');

            unlockSound.play();

            setTimeout(() => {
                lockImage.src = 'assets/images/unlocked_lock.png';
                if (inputsContainer) {
                    inputsContainer.classList.add('unlocked');
                }
            }, 1200); 
            
            setTimeout(() => {
                if (inputsContainer) {
                    inputsContainer.classList.add('hidden'); 
                }
            }, 2000);

            setTimeout(() => {
                overlay.classList.add('active');
                setTimeout(() => {
                    loginSection.classList.remove('active');
                    loginSection.classList.add('hidden');
                    webtoonSection.classList.remove('hidden');
                    webtoonSection.classList.add('active');
                    overlay.classList.remove('active'); 
                    startWebtoon();
                    // Resetear el scroll del webtoon
                    webtoonSection.scrollTop = 0;
                }, 2000); 
            }, 2000); 
        } else {
            showToast('Código incorrecto. Intenta de nuevo.', 'error');
            
            // Limpiar todos los inputs
            dayInput.value = '';
            monthInput.value = '';
            yearInput.value = '';
            
            // Volver el focus al primer input
            dayInput.focus();
        }
    }

    // Función para crear fuegos pirotecnicos
    function triggerFireworks() {
        const colors = ['red', 'gold', 'blue'];
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        // Reproducir sonido de fuegos
        const fireworkSound = new Audio('assets/sounds/fireworks.mp3');
        fireworkSound.play();

        for (let i = 0; i < 120; i++) {
            setTimeout(() => {
                const firework = document.createElement('div');
                firework.className = `firework ${colors[Math.floor(Math.random() * colors.length)]}`;
                
                const angle = (Math.random() * Math.PI * 2);
                const velocity = 5 + Math.random() * 10;
                const tx = Math.cos(angle) * velocity * 50;
                const ty = Math.sin(angle) * velocity * 50;
                
                firework.style.left = centerX + 'px';
                firework.style.top = centerY + 'px';
                firework.style.setProperty('--tx', tx + 'px');
                firework.style.setProperty('--ty', ty + 'px');
                
                document.body.appendChild(firework);
                
                setTimeout(() => firework.remove(), 1500);
            }, i * 100);
        }
    }

    // Función para actualizar la imagen del personaje
    function updateCharacterImage() {
        const galleryCharacter = document.querySelector('.gallery-character');
        if (galleryCharacter) {
            galleryCharacter.src = `assets/images/stardew_character_${currentCharacterFrame}.png`;
        }
    }

    // Función para animar el personaje caminando
    function startCharacterAnimation() {
        if (characterAnimationInterval) return;
        
        isMoving = true;
        characterAnimationInterval = setInterval(() => {
            currentCharacterFrame = currentCharacterFrame === 3 ? 1 : currentCharacterFrame + 1;
            updateCharacterImage();
        }, 150);
    }

    // Función para detener la animación del personaje
    function stopCharacterAnimation() {
        if (characterAnimationInterval) {
            clearInterval(characterAnimationInterval);
            characterAnimationInterval = null;
            isMoving = false;
            currentCharacterFrame = 1;
            updateCharacterImage();
        }
    }

    // Función para mostrar besos animados
    function showKisses(closeBtn) {
        let kissCount = 0;
        
        const kissInterval = setInterval(() => {
            if (kissCount >= 64) {
                clearInterval(kissInterval);
                // Mostrar botón de cerrar
                closeBtn.style.display = 'block';
                return;
            }
            
            // Crear imagen de beso aleatoria
            const kiss = document.createElement('img');
            kiss.src = 'assets/images/kiss.png';
            kiss.style.position = 'fixed';
            kiss.style.width = '80px';
            kiss.style.height = '80px';
            kiss.style.pointerEvents = 'none';
            kiss.style.zIndex = '46';
            kiss.style.opacity = '0.9';
            kiss.style.animation = 'fadeOut 0.8s ease-out forwards';
            
            // Posición aleatoria
            const x = Math.random() * (window.innerWidth - 80);
            const y = Math.random() * (window.innerHeight - 80);
            kiss.style.left = x + 'px';
            kiss.style.top = y + 'px';
            
            document.body.appendChild(kiss);
            
            // Reproducir sonido de beso
            const kissSound = new Audio('assets/sounds/kiss.mp3');
            kissSound.play();
            
            // Remover beso después de la animación
            setTimeout(() => kiss.remove(), 800);
            
            kissCount++;
        }, 150); // Cada 150ms aparece un beso con su sonido
    }

    // Función para mostrar logro
    function showAchievement() {
        const achievementSound = new Audio('assets/sounds/steam_notification.mp3');
        
        // Crear modal del logro
        const achievementModal = document.createElement('div');
        achievementModal.style.position = 'fixed';
        achievementModal.style.top = '0';
        achievementModal.style.left = '0';
        achievementModal.style.width = '100%';
        achievementModal.style.height = '100%';
        achievementModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        achievementModal.style.display = 'flex';
        achievementModal.style.justifyContent = 'center';
        achievementModal.style.alignItems = 'center';
        achievementModal.style.zIndex = '50';
        achievementModal.style.cursor = 'pointer';
        
        const achievementImg = document.createElement('img');
        achievementImg.src = 'assets/images/logro.png';
        achievementImg.style.maxWidth = '400px';
        achievementImg.style.maxHeight = '400px';
        achievementImg.style.animation = 'scaleIn 0.5s ease-out';
        
        achievementModal.appendChild(achievementImg);
        document.body.appendChild(achievementModal);
        achievementSound.play();
        
        // Cerrar al hacer clic en el modal
        achievementModal.addEventListener('click', () => {
            achievementModal.remove();
        });
    }

    // Función para cargar galería
    function loadGallery() {
        const galleryContainer = document.getElementById('gallery-container');
        const totalImages = 51;

        // Cargar todas las imágenes de la galería (00 a 50)
        for (let i = 0; i <= totalImages; i++) {
            const item = document.createElement('div');
            item.className = 'gallery-item';

            const frame = document.createElement('div');
            frame.className = 'gallery-frame';

            const img = document.createElement('img');
            img.src = `assets/gallery/${i.toString().padStart(2, '0')}.jpg`;
            img.alt = `Cuadro ${i}`;

            frame.appendChild(img);
            item.appendChild(frame);

            // Click en imagen abre modal ampliado
            frame.addEventListener('click', (e) => {
                e.stopPropagation();
                openImageModal(img.src);
            });

            galleryContainer.appendChild(item);
        }

        // Agregar área de upload al final
        const uploadItem = document.createElement('div');
        uploadItem.className = 'gallery-item';
        uploadItem.id = 'upload-item';

        const uploadFrame = document.createElement('div');
        uploadFrame.className = 'gallery-frame gallery-upload';
        uploadFrame.id = 'upload-frame';

        const uploadIcon = document.createElement('img');
        uploadIcon.src = 'assets/images/upload-icon.png';
        uploadIcon.alt = 'Subir imagen';
        uploadIcon.className = 'upload-icon';

        const uploadText = document.createElement('p');
        uploadText.className = 'upload-text';
        uploadText.textContent = 'Obra incompleta';

        const uploadInput = document.createElement('input');
        uploadInput.type = 'file';
        uploadInput.accept = 'image/*';
        uploadInput.className = 'upload-input';
        uploadInput.id = 'gallery-upload-input';

        uploadFrame.appendChild(uploadIcon);
        uploadFrame.appendChild(uploadText);
        uploadFrame.appendChild(uploadInput);

        uploadItem.appendChild(uploadFrame);

        // Agregar evento para subir imagen
        uploadFrame.addEventListener('click', () => {
            uploadInput.click();
        });

        uploadInput.addEventListener('change', (e) => {
            handleImageUpload(e);
        });

        galleryContainer.appendChild(uploadItem);

        // Crear botones de acción
        const buttonsContainer = document.createElement('div');
        buttonsContainer.className = 'gallery-buttons';
        buttonsContainer.id = 'gallery-buttons';

        const btn1 = document.createElement('button');
        btn1.className = 'gallery-btn gallery-btn-1 disabled';
        btn1.id = 'gallery-btn-1';
        const btnImg1 = document.createElement('img');
        btnImg1.src = 'assets/images/picture.png';
        btn1.appendChild(btnImg1);

        const btn2 = document.createElement('button');
        btn2.className = 'gallery-btn gallery-btn-2 disabled';
        btn2.id = 'gallery-btn-2';
        const btnImg2 = document.createElement('img');
        btnImg2.src = 'assets/images/love_letter.png';
        btn2.appendChild(btnImg2);

        buttonsContainer.appendChild(btn1);
        buttonsContainer.appendChild(btn2);
        gallerySection.appendChild(buttonsContainer);

        // Eventos de los botones
        btn1.addEventListener('click', () => {
            if (!btn1.classList.contains('disabled') && !button1Clicked) {
                handleButton1Click(btn1, btn2, btnImg1);
            }
        });

        btn2.addEventListener('click', () => {
            if (!btn2.classList.contains('disabled')) {
                handleButton2Click(btn2);
            }
        });

        // Iniciar control del carrusel y personaje
        startGalleryControl();
    }

    // Función para manejar click del botón 1
    function handleButton1Click(btn1, btn2, btnImg1) {
        button1Clicked = true; // Marcar que fue clickeado
        
        // Cambiar imagen a picture_love.png
        btnImg1.src = 'assets/images/picture_love.png';
        
        // Crear un modal separado para los besos (no usar el image-modal)
        const kissesModal = document.createElement('div');
        kissesModal.id = 'kisses-modal';
        kissesModal.style.position = 'fixed';
        kissesModal.style.top = '0';
        kissesModal.style.left = '0';
        kissesModal.style.width = '100%';
        kissesModal.style.height = '100%';
        kissesModal.style.backgroundColor = 'rgba(0, 0, 0, 0.9)';
        kissesModal.style.display = 'flex';
        kissesModal.style.justifyContent = 'center';
        kissesModal.style.alignItems = 'center';
        kissesModal.style.zIndex = '40';
        
        // Crear contenedor para la imagen picture_love
        const pictureContainer = document.createElement('div');
        pictureContainer.style.position = 'relative';
        pictureContainer.style.width = '100%';
        pictureContainer.style.height = '100%';
        pictureContainer.style.display = 'flex';
        pictureContainer.style.justifyContent = 'center';
        pictureContainer.style.alignItems = 'center';
        
        const pictureLoveImg = document.createElement('img');
        pictureLoveImg.src = 'assets/images/picture_love.png';
        pictureLoveImg.style.width = 'auto';
        pictureLoveImg.style.height = '100%';
        pictureLoveImg.style.margin = '5px 0';
        pictureLoveImg.style.maxHeight = '90vh';
        pictureLoveImg.style.objectFit = 'contain';
        
        pictureContainer.appendChild(pictureLoveImg);
        kissesModal.appendChild(pictureContainer);
        
        // Crear botón de cerrar
        const closeBtn = document.createElement('button');
        closeBtn.className = 'image-modal-close';
        closeBtn.style.position = 'absolute';
        closeBtn.style.top = '20px';
        closeBtn.style.right = '30px';
        closeBtn.style.backgroundColor = 'transparent';
        closeBtn.style.border = 'none';
        closeBtn.style.fontSize = '40px';
        closeBtn.style.color = 'white';
        closeBtn.style.cursor = 'pointer';
        closeBtn.style.zIndex = '47';
        closeBtn.style.display = 'none';
        closeBtn.textContent = '×';
        
        kissesModal.appendChild(closeBtn);
        document.body.appendChild(kissesModal);
        
        // Mostrar besos
        showKisses(closeBtn);
        
        // Cuando se cierre, habilitar botón 2
        closeBtn.onclick = () => {
            kissesModal.remove();
            const btn2 = document.getElementById('gallery-btn-2');
            btn2.classList.remove('disabled');
            btn2.classList.add('visible');
        };
    }

    // Función para manejar click del botón 2
    function handleButton2Click(btn2) {
        btn2.classList.add('disabled');
        
        // Crear y mostrar modal de carta de amor
        const loveLetterModal = document.createElement('div');
        loveLetterModal.className = 'modal active';
        loveLetterModal.id = 'love-letter-modal';
        loveLetterModal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>Amore mio</h2>
                </div>
                <div class="modal-body">
                    <p> Has llegado al final de esta aventura. Espero de corazon que hayas disfrutado cada detalle de esta sorpresa. Es mi forma de ponerle un marco a la historia que hemos construido y a cada mundo que recorrimos juntos.
                        Hoy celebramos la conexion profunda que nos ha permitido crecer y la certeza de que nuestros corazones son el refugio del otro.
                        Gracias por hacer de mi vida una historia inolvidable, siendo nosotros los protagonistas.</p>
                    <p>-Princesa de Novigrado</p>
                </div>
                <button class="close-button" id="close-love-letter">
                    <img src="assets/images/arrow_stardewvalley.png" alt="Cerrar">
                </button>
            </div>
        `;
        
        document.body.appendChild(loveLetterModal);
        
        // Evento para cerrar la carta de amor
        const closeLoveLetterBtn = document.getElementById('close-love-letter');
        closeLoveLetterBtn.addEventListener('click', () => {
            loveLetterModal.remove();
            // Mostrar logro
            showAchievement();
        });
    }

    // Función para manejar upload de imagen
    function handleImageUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const uploadFrame = document.getElementById('upload-frame');

                // Crear imagen del cuadro subido
                const uploadedImg = document.createElement('img');
                uploadedImg.src = event.target.result;
                uploadedImg.alt = 'Cuadro subido';

                // Reemplazar el contenido del área de upload
                uploadFrame.innerHTML = '';
                uploadFrame.classList.remove('gallery-upload');
                uploadFrame.appendChild(uploadedImg);

                // Mostrar botones
                const btn1 = document.getElementById('gallery-btn-1');
                const btn2 = document.getElementById('gallery-btn-2');
                
                btn1.classList.remove('disabled');
                btn1.classList.add('visible');
                btn2.classList.add('visible');
                btn2.classList.add('disabled');

                // Disparar fuegos pirotecnicos
                triggerFireworks();
            };
            reader.readAsDataURL(file);
        }
    }

    // Función para abrir modal de imagen
    function openImageModal(src) {
        const imageModal = document.getElementById('image-modal');
        const modalImage = document.getElementById('modal-image');
        const closeBtn = imageModal.querySelector('.image-modal-close');
        
        if (imageModal && modalImage) {
            modalImage.src = src;
            modalImage.style.width = '65%';
            modalImage.style.height = '100%';
            modalImage.style.objectFit = 'contain';
            modalImage.style.display = 'block';
            closeBtn.style.display = 'block';
            imageModal.classList.remove('hidden');
        }
    }

    // Función para cerrar modal de imagen
    function closeImageModal() {
        const imageModal = document.getElementById('image-modal');
        if (imageModal) {
            imageModal.classList.add('hidden');
        }
    }

    // Función para actualizar posición del personaje basada en scroll
    function updateCharacterFromScroll() {
        const scrollWidth = gallerySection.scrollWidth - gallerySection.clientWidth;
        const scrollPercentage = scrollWidth > 0 ? gallerySection.scrollLeft / scrollWidth : 0;
        
        // El personaje se mueve desde 30px hasta un poco más de la mitad
        const maxCharacterPosition = window.innerWidth * 0.6;
        characterPosition = 30 + (scrollPercentage * (maxCharacterPosition - 30));
        
        updateCharacterPosition();
    }

    // Función para controlar movimiento del carrusel y personaje
    function startGalleryControl() {
        // Control por rueda del mouse
        gallerySection.addEventListener('wheel', (e) => {
            e.preventDefault();
            
            startCharacterAnimation();
            
            if (e.deltaY > 0) {
                // Scroll hacia abajo = derecha
                gallerySection.scrollLeft += 80;
            } else {
                // Scroll hacia arriba = izquierda
                gallerySection.scrollLeft -= 80;
            }
            
            updateCharacterFromScroll();
            
            // Detener animación después de que se termine de scrollear
            if (scrollTimeout) clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                stopCharacterAnimation();
            }, 300);
        }, { passive: false });

        // Control por scroll del mouse/trackpad
        gallerySection.addEventListener('scroll', () => {
            startCharacterAnimation();
            updateCharacterFromScroll();
            
            // Limpiar timeout anterior
            if (scrollTimeout) clearTimeout(scrollTimeout);
            
            // Detener animación después de que se termine de scrollear
            scrollTimeout = setTimeout(() => {
                stopCharacterAnimation();
            }, 300);
        });
    }

    // Actualizar posición del personaje
    function updateCharacterPosition() {
        const galleryCharacter = document.querySelector('.gallery-character');
        if (galleryCharacter) {
            galleryCharacter.style.left = characterPosition + 'px';
        }
    }

    // Event listeners para modal de imagen
    document.addEventListener('click', (e) => {
        if (e.target.classList && e.target.classList.contains('image-modal-close')) {
            closeImageModal();
        }
    });

    // Cerrar modal al hacer click fuera
    document.addEventListener('click', (e) => {
        const imageModal = document.getElementById('image-modal');
        if (imageModal && e.target === imageModal) {
            closeImageModal();
        }
    });

    // Cerrar modal de carta y transicionar a galería
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        modal.classList.add('hidden');
        
        // Detener la música de fondo
        if (backgroundMusic) {
            backgroundMusic.pause();
            backgroundMusic.currentTime = 0;
            backgroundMusic = null;
        }
        
        // Iniciar transición a galería
        setTimeout(() => {
            overlay.classList.add('active');
            setTimeout(() => {
                webtoonSection.classList.remove('active');
                webtoonSection.classList.add('hidden');
                gallerySection.classList.remove('hidden');
                gallerySection.classList.add('active');
                overlay.classList.remove('active');
                
                // Cargar galería cuando sea visible
                loadGallery();
            }, 2000);
        }, 300);
    });

    // Event listeners para inputs - máximo 2 dígitos y auto-avance
    [dayInput, monthInput, yearInput].forEach((input, index) => {
        input.addEventListener('input', (e) => {
            // Limitar a 2 dígitos
            if (e.target.value.length > 2) {
                e.target.value = e.target.value.slice(0, 2);
            }
            
            // Pasar al siguiente input cuando hay 2 dígitos
            if (e.target.value.length === 2) {
                const inputs = [dayInput, monthInput, yearInput];
                if (index < inputs.length - 1) {
                    inputs[index + 1].focus();
                }
            }
        });
    });

    // Enter global para validar
    document.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            // Si estamos en el login (cuando los inputs son visibles)
            if (!loginSection.classList.contains('hidden')) {
                checkInputs();
            }
        }
    });
});