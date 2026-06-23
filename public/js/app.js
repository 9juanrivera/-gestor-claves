// Variables de estado
let usuarioActual = null;

// Referencias a secciones
const seccionLogin = document.getElementById('seccion-login');
const seccionRegistro = document.getElementById('seccion-registro');
const seccionPanel = document.getElementById('seccion-panel');

// Función para mostrar solo una sección
function mostrarSeccion(seccion) {
    seccionLogin.style.display = 'none';
    seccionRegistro.style.display = 'none';
    seccionPanel.style.display = 'none';
    seccion.style.display = 'block';
}

// Navegar entre login y registro
document.getElementById('ir-registro').addEventListener('click', () => {
    mostrarSeccion(seccionRegistro);
});

document.getElementById('ir-login').addEventListener('click', () => {
    mostrarSeccion(seccionLogin);
});

// Login
document.getElementById('btn-entrar').addEventListener('click', function() {
    const nombre = document.getElementById('nombre').value;
    const codigo = document.getElementById('codigo').value;

    fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, codigo })
    })
    .then(res => res.json())
    .then(data => {
        if (data.exito) {
            usuarioActual = { nombre: data.usuario, id: data.id };
            cargarContrasenas();
            mostrarSeccion(seccionPanel);
        } else {
            alert(data.mensaje);
        }
    });
});

// Registro
document.getElementById('btn-registrar').addEventListener('click', function() {
    const nombre = document.getElementById('reg-nombre').value;
    const codigo = document.getElementById('reg-codigo').value;

    fetch('/api/registro', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, codigo })
    })
    .then(res => res.json())
    .then(data => {
        if (data.exito) {
            alert('Cuenta creada, ya puedes iniciar sesión');
            mostrarSeccion(seccionLogin);
        } else {
            alert(data.mensaje);
        }
    });
});

// Cargar contraseñas
function cargarContrasenas() {
    fetch('/api/contrasenas/' + usuarioActual.id)
    .then(res => res.json())
    .then(resp => {
        const lista = document.getElementById('lista-claves');
        lista.innerHTML = '';

        resp.contrasenas.forEach(item => {
            lista.innerHTML += `
                <div class="tarjeta-clave">
                    <h3>${item.app}</h3>
                    <p>Usuario: ${item.usuario_app}</p>
                    <p>Contraseña: 
                        <span id="clave-${item.id}">••••••</span>
                        <button class="btn-ver" onclick="verClave('${item.id}', '${item.contrasena}')">Ver</button>
                    </p>
                </div>
            `;
        });
    });
}

// Ver / ocultar contraseña
function verClave(id, contrasena) {
    const span = document.getElementById('clave-' + id);
    if (span.textContent === '••••••') {
        span.textContent = contrasena;
    } else {
        span.textContent = '••••••';
    }
}

// Agregar contraseña
document.getElementById('btn-agregar').addEventListener('click', function() {
    const app = document.getElementById('nueva-app').value;
    const usuario_app = document.getElementById('nuevo-usuario').value;
    const contrasena = document.getElementById('nueva-clave').value;

    fetch('/api/contrasenas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario_id: usuarioActual.id, app, usuario_app, contrasena })
    })
    .then(res => res.json())
    .then(data => {
        if (data.exito) {
            document.getElementById('nueva-app').value = '';
            document.getElementById('nuevo-usuario').value = '';
            document.getElementById('nueva-clave').value = '';
            cargarContrasenas();
        } else {
            alert(data.mensaje);
        }
    });
});

// Cerrar sesión
document.getElementById('btn-salir').addEventListener('click', function() {
    usuarioActual = null;
    document.getElementById('lista-claves').innerHTML = '';
    mostrarSeccion(seccionLogin);
});