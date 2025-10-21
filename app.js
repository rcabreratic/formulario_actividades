// Espera a que el contenido del DOM esté cargado
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURACIÓN ---
    
    /**
     * ¡¡¡IMPORTANTE!!!
     * Pega aquí la URL de tu Google Apps Script que obtuviste en la Fase 1.
     */
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbydYjJS_MVsrQ6ze7FbLBAT0a5Kv3BqU6au4oRbEB8vAKB9tPLmK3W_T21-Yhi7gwN_/exec";


    // Listas de datos que hemos definido
    const DEPARTAMENTOS = [
        "Biología y Geología", "Dibujo", "Economía y FOL", "Educación Física",
        "Energía y Agua", "Filosofía", "Física y Química", "Francés",
        "Geografía e Historia", "Informática", "Inglés", "Jefatura de Estudios",
        "Latín y Griego", "Lengua Castellana y Literatura", "Matemáticas",
        "Música", "Orientación", "Religión", "Tecnología"
    ];

    const NIVELES = {
        "ESO": ["1º ESO", "2º ESO", "3º ESO", "4º ESO"],
        "Bachillerato": ["1º Bachillerato", "2º Bachillerato"],
        "FP": [
            "1º FPB Informática y Comunicaciones", "2º FPB Informática y Comunicaciones",
            "1º SMR (Sistemas Microinformáticos y Redes)", "2º SMR (Sistemas Microinformáticos y Redes)",
            "1º ASIR (Admón. de Sistemas Informáticos en Red)", "2º ASIR (Admón. de Sistemas Informáticos en Red)",
            "1º DAW (Desarrollo de Aplicaciones Web)", "2º DAW (Desarrollo de Aplicaciones Web)",
            "1º ER (Energías Renovables)", "2º ER (Energías Renovables)"
        ]
    };

    // --- REFERENCIAS A ELEMENTOS DEL DOM ---
    const form = document.getElementById('activityForm');
    const departamentoSelect = document.getElementById('departamento');
    const activitiesContainer = document.getElementById('activities-container');
    const addActivityBtn = document.getElementById('addActivityBtn');
    const template = document.getElementById('activity-template');
    const submitBtn = document.getElementById('submitBtn');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');
    const formMessage = document.getElementById('form-message');

    // --- INICIALIZACIÓN ---

    // Rellena el desplegable de departamentos
    function initDepartamentos() {
        departamentoSelect.innerHTML = '<option value="">Selecciona tu departamento...</option>';
        DEPARTAMENTOS.forEach(dep => {
            const option = document.createElement('option');
            option.value = dep;
            option.textContent = dep;
            departamentoSelect.appendChild(option);
        });
    }

    // Añade el primer bloque de actividad al cargar la página
    function init() {
        initDepartamentos();
        addActivityBlock();
    }

    // --- LÓGICA DE ACTIVIDADES ---

    /**
     * Añade un nuevo bloque de actividad al formulario
     */
    function addActivityBlock() {
        // Clona la plantilla
        const clone = template.content.cloneNode(true);
        const activityBlock = clone.querySelector('.activity-block');
        
        // Asigna listeners de eventos al nuevo bloque
        setupEventListeners(activityBlock);
        
        // Añade el bloque al contenedor
        activitiesContainer.appendChild(activityBlock);
        
        // Actualiza el título de los bloques (Actividad 1, Actividad 2, etc.)
        updateActivityTitles();
    }

    /**
     * Elimina un bloque de actividad
     */
    function removeActivityBlock(button) {
        // Pide confirmación
        if (confirm("¿Estás seguro de que quieres eliminar esta actividad?")) {
            const activityBlock = button.closest('.activity-block');
            activityBlock.remove();
            
            // Si es el último bloque, añade uno nuevo para que nunca esté vacío
            if (activitiesContainer.childElementCount === 0) {
                addActivityBlock();
            } else {
                updateActivityTitles();
            }
        }
    }
    
    /**
     * Actualiza los títulos de las actividades (Actividad 1, Actividad 2...)
     */
    function updateActivityTitles() {
        const blocks = activitiesContainer.querySelectorAll('.activity-block');
        blocks.forEach((block, index) => {
            const title = block.querySelector('.activity-title');
            const nameInput = block.querySelector('.activity-name');
            // Actualiza el título en tiempo real si el usuario escribe un nombre
            nameInput.addEventListener('input', () => {
                title.textContent = nameInput.value || `Actividad ${index + 1}`;
            });
            // Título por defecto
            if (!nameInput.value) {
                title.textContent = `Actividad ${index + 1}`;
            }
        });
    }

    // --- LÓGICA CONDICIONAL (CAMPOS DINÁMICOS) ---

    /**
     * Asigna todos los event listeners a un bloque de actividad
     */
    function setupEventListeners(activityBlock) {
        // Botón de eliminar
        const removeBtn = activityBlock.querySelector('.btn-remove-activity');
        removeBtn.addEventListener('click', () => removeActivityBlock(removeBtn));

        // 1. Lógica para Etapa -> Niveles
        const etapaSelect = activityBlock.querySelector('.etapa-select');
        etapaSelect.addEventListener('change', () => handleEtapaChange(etapaSelect));
        
        // 2. Lógica para Tipo Duración -> Fechas
        const tipoDuracionSelect = activityBlock.querySelector('.tipoDuracion-select');
        tipoDuracionSelect.addEventListener('change', () => handleDuracionChange(tipoDuracionSelect));
        
        // 3. Lógica para Tipo Horario -> Implicación
        const tipoHorarioSelect = activityBlock.querySelector('.tipoHorario-select');
        tipoHorarioSelect.addEventListener('change', () => handleHorarioChange(tipoHorarioSelect));
    }

    /**
     * Muestra/oculta los niveles según la etapa seleccionada
     */
    function handleEtapaChange(select) {
        const activityBlock = select.closest('.activity-block');
        const nivelesContainer = activityBlock.querySelector('.niveles-container');
        const checkboxGroup = nivelesContainer.querySelector('.checkbox-group');
        
        const etapa = select.value;
        checkboxGroup.innerHTML = ''; // Limpia los checkboxes anteriores

        if (etapa && NIVELES[etapa]) {
            // Rellena los checkboxes
            NIVELES[etapa].forEach(nivel => {
                const id = `nivel-${etapa}-${nivel.replace(/\s+/g, '-')}-${Math.random()}`; // ID único
                const item = document.createElement('div');
                item.className = 'checkbox-item';
                item.innerHTML = `
                    <input type="checkbox" id="${id}" name="nivel" value="${nivel}">
                    <label for="${id}">${nivel}</label>
                `;
                checkboxGroup.appendChild(item);
            });
            nivelesContainer.classList.remove('hidden');
        } else {
            nivelesContainer.classList.add('hidden');
        }
    }

    /**
     * Muestra/oculta los campos de fecha según la duración
     */
    function handleDuracionChange(select) {
        const activityBlock = select.closest('.activity-block');
        const fechaUnica = activityBlock.querySelector('.fecha-unica-container');
        const fechasMultiples = activityBlock.querySelector('.fechas-multiples-container');
        const fechaUnicaInput = fechaUnica.querySelector('input');
        const fechaInicioInput = fechasMultiples.querySelector('input[name="fechaInicio"]');
        const fechaFinInput = fechasMultiples.querySelector('input[name="fechaFin"]');
        
        const duracion = select.value;
        
        // Oculta todo y quita 'required'
        fechaUnica.classList.add('hidden');
        fechasMultiples.classList.add('hidden');
        fechaUnicaInput.required = false;
        fechaInicioInput.required = false;
        fechaFinInput.required = false;

        if (duracion === "Una sola jornada") {
            fechaUnica.classList.remove('hidden');
            fechaUnicaInput.required = true;
        } else if (duracion === "Múltiples jornadas") {
            fechasMultiples.classList.remove('hidden');
            fechaInicioInput.required = true;
            fechaFinInput.required = true;
        }
    }

    /**
     * Muestra/oculta el campo de implicación lectiva
     */
    function handleHorarioChange(select) {
        const activityBlock = select.closest('.activity-block');
        const implicacionContainer = activityBlock.querySelector('.implicacion-container');
        const implicacionSelect = implicacionContainer.querySelector('select');
        
        if (select.value === "Durante el horario lectivo") {
            implicacionContainer.classList.remove('hidden');
            implicacionSelect.required = true;
        } else {
            implicacionContainer.classList.add('hidden');
            implicacionSelect.required = false;
            implicacionSelect.value = ""; // Limpia el valor si se oculta
        }
    }

    // --- ENVÍO DEL FORMULARIO (SUBMIT) ---
    
    /**
     * Valida el formulario antes de enviar
     */
    function validateForm() {
        formMessage.textContent = '';
        formMessage.className = 'form-message';
        let isValid = true;

        // 1. Valida los campos del formulario principal
        if (!form.checkValidity()) {
            isValid = false;
        }

        // 2. Valida la lógica de checkboxes (al menos uno)
        const activityBlocks = activitiesContainer.querySelectorAll('.activity-block');
        activityBlocks.forEach((block, index) => {
            const nivelesCheckboxes = block.querySelectorAll('input[name="nivel"]:checked');
            if (nivelesCheckboxes.length === 0) {
                isValid = false;
                const nivelesContainer = block.querySelector('.niveles-container');
                nivelesContainer.style.border = '2px solid var(--color-error)';
            } else {
                const nivelesContainer = block.querySelector('.niveles-container');
                nivelesContainer.style.border = 'none';
            }
        });
        
        if (!isValid) {
            formMessage.textContent = "Por favor, revisa los campos marcados en rojo. Debes seleccionar al menos un nivel por actividad.";
            formMessage.classList.add('error');
            // Dispara la validación visual nativa del navegador
            form.reportValidity(); 
        }
        
        return isValid;
    }

    /**
     * Construye el objeto JSON para enviar a Google Apps Script
     */
    function buildJSONPayload() {
        const payload = {
            departamento: departamentoSelect.value,
            email: document.getElementById('email').value,
            actividades: []
        };
        
        const activityBlocks = activitiesContainer.querySelectorAll('.activity-block');
        
        activityBlocks.forEach(block => {
            // Recoge los niveles seleccionados
            const niveles = [];
            block.querySelectorAll('input[name="nivel"]:checked').forEach(checkbox => {
                niveles.push(checkbox.value);
            });
            
            const actividad = {
                nombre: block.querySelector('input[name="nombre"]').value,
                etapa: block.querySelector('select[name="etapa"]').value,
                niveles: niveles, // Array de niveles
                trimestre: block.querySelector('select[name="trimestre"]').value,
                tipoDuracion: block.querySelector('select[name="tipoDuracion"]').value,
                fechaUnica: block.querySelector('input[name="fechaUnica"]').value,
                fechaInicio: block.querySelector('input[name="fechaInicio"]').value,
                fechaFin: block.querySelector('input[name="fechaFin"]').value,
                pernocta: block.querySelector('select[name="pernocta"]').value,
                tipoHorario: block.querySelector('select[name="tipoHorario"]').value,
                implicacionLectiva: block.querySelector('select[name="implicacionLectiva"]').value
            };
            payload.actividades.push(actividad);
        });
        
        return payload;
    }

    /**
     * Maneja el envío del formulario
     */
    async function handleSubmit(e) {
        e.preventDefault(); // Evita que el formulario se envíe de forma tradicional
        
        if (!validateForm()) {
            return;
        }

        // Mostrar estado de carga
        submitBtn.disabled = true;
        btnText.classList.add('hidden');
        btnLoader.classList.remove('hidden');
        formMessage.textContent = 'Enviando datos...';
        formMessage.className = 'form-message';

        try {
            const payload = buildJSONPayload();
            
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                mode: 'cors', // Necesario para peticiones cross-origin
                // NO AÑADIMOS CABECERA 'Content-Type'. 
                // fetch() usará 'text/plain' por defecto.
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.status === "ok") {
                // Éxito
                formMessage.textContent = "¡Actividades enviadas con éxito!";
                formMessage.classList.add('success');
                form.reset(); // Limpia el formulario
                // Recarga los departamentos y añade el primer bloque de actividad
                initDepartamentos();
                activitiesContainer.innerHTML = '';
                addActivityBlock();
            } else {
                // Error devuelto por el script
                throw new Error(result.message || 'Error desconocido del servidor.');
            }

        } catch (error) {
            // Error de red o en el 'catch' del script
            console.error('Error al enviar el formulario:', error);
            formMessage.textContent = `Error al enviar: ${error.message}. Por favor, inténtalo de nuevo.`;
            formMessage.classList.add('error');
        } finally {
            // Ocultar estado de carga
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
    }

    // --- ASIGNACIÓN DE EVENTOS PRINCIPALES ---
    addActivityBtn.addEventListener('click', addActivityBlock);
    form.addEventListener('submit', handleSubmit);

    // --- Inicia la aplicación ---
    init();


});
