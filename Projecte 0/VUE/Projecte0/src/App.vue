<template>
  <div class="container">
    <h1 class="text-center">CRUD Preguntes Marca</h1>

    <!-- Listado de preguntas -->
    <div v-for="(pregunta, index) in preguntes" :key="pregunta.id" class="pregunta-card">
      <h3>{{ pregunta.pregunta }}</h3>
      <img :src="pregunta.imatge" alt="Imatge de la pregunta" class="pregunta-imagen" />
      <h4>Respostes:</h4>
      <ul class="respostes-list">
        <li
          v-for="(resposta, rIndex) in pregunta.respostes"
          :key="rIndex"
          :class="{ 'respuesta-correcta': rIndex === pregunta.resposta_correcta }"
        >
          {{ resposta }}
        </li>
      </ul>
      <div class="button-group">
        <button class="btn btn-edit" @click="editarPregunta(index)">
          <i class="fas fa-edit"></i> Editar
        </button>
        <button class="btn btn-delete" @click="eliminarPregunta(pregunta.id)">
          <i class="fas fa-trash-alt"></i> Eliminar
        </button>
      </div>
    </div>

    <!-- Formulario para agregar/editar preguntas -->
    <div v-if="modoEdicion" class="form-container">
      <h2>{{ editandoIndex !== null ? 'Editar Pregunta' : 'Afegir Pregunta' }}</h2>
      <input type="text" v-model="preguntaForm.pregunta" class="form-control" placeholder="Pregunta" />
      <input type="text" v-model="preguntaForm.imatge" class="form-control" placeholder="Imatge URL" />
      <h4>Respostes</h4>
      <div v-for="(resposta, rIndex) in preguntaForm.respostes" :key="rIndex">
        <input
          type="text"
          v-model="preguntaForm.respostes[rIndex]"
          class="form-control"
          placeholder="Resposta"
        />
      </div>
      <h4>Resposta correcta:</h4>
      <select v-model="preguntaForm.resposta_correcta" class="form-control">
        <option v-for="(resposta, rIndex) in preguntaForm.respostes" :key="rIndex" :value="rIndex">
          {{ resposta }}
        </option>
      </select>
      <button class="btn btn-save" @click="guardarPregunta">Guardar Pregunta</button>
    </div>

    <!-- Botón para agregar nuevas preguntas -->
    <button class="btn btn-add" @click="agregarPregunta">Afegir Pregunta</button>
  </div>
</template>


<script>
import { ref, onMounted } from "vue";

export default {
  setup() {
    const preguntes = ref([]);
    const modoEdicion = ref(false);
    const editandoIndex = ref(null);

    const preguntaForm = ref({
      id: null, // Agregado para manejar el ID de la pregunta
      pregunta: "",
      imatge: "",
      respostes: ["", "", "", ""],
      resposta_correcta: 0
    });

    // Cargar preguntas desde el servidor
    const cargarPreguntes = () => {
      fetch('http://a23marrojgon.dam.inspedralbes.cat:27158/preguntes')
        .then(response => response.json())
        .then(data => {
          preguntes.value = data.preguntes;
        })
        .catch(error => {
          console.error('Error cargando JSON:', error);
        });
    };

    // Agregar una nueva pregunta
    const agregarPregunta = () => {
      modoEdicion.value = true;
      editandoIndex.value = null;
      resetForm();
    };

// Función para iniciar la edición de una pregunta
const editarPregunta = (index) => {
  modoEdicion.value = true;
  editandoIndex.value = index;
  // Cargar la pregunta seleccionada en el formulario
  preguntaForm.value = { ...preguntes.value[index] }; // Copiar la pregunta en el formulario
};

// Guardar pregunta (nueva o editada)
const guardarPregunta = () => {
  const method = editandoIndex.value !== null ? 'PUT' : 'POST';
  const url = editandoIndex.value !== null
    ? `http://a23marrojgon.dam.inspedralbes.cat:27158/preguntes/${preguntaForm.value.id}` // Usar el ID de la pregunta al hacer PUT
    : 'http://a23marrojgon.dam.inspedralbes.cat:27158/preguntes'; // Crear nueva pregunta con POST

  fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preguntaForm.value) // Enviar los datos del formulario
  })
    .then(() => {
      cargarPreguntes(); // Volver a cargar las preguntas después de guardar
      modoEdicion.value = false; // Ocultar el formulario
      resetForm(); // Limpiar el formulario
    })
    .catch(error => {
      console.error('Error guardando pregunta:', error);
    });
};





// Función para eliminar una pregunta
const eliminarPregunta = (id) => {
  fetch(`http://a23marrojgon.dam.inspedralbes.cat:27158/preguntes/${id}`, {
    method: 'DELETE'
  })
  .then(() => {
    cargarPreguntes(); // Volver a cargar las preguntas después de eliminar
  })
  .catch(error => {
    console.error('Error eliminando pregunta:', error);
  });
};



    // Resetear el formulario
    const resetForm = () => {
      preguntaForm.value = {
        id: null,
        pregunta: "",
        imatge: "",
        respostes: ["", "", "", ""],
        resposta_correcta: 0
      };
    };

    onMounted(() => {
      cargarPreguntes();
    });

    return {
      preguntes,
      modoEdicion,
      editandoIndex,
      preguntaForm,
      agregarPregunta,
      editarPregunta,
      guardarPregunta,
      eliminarPregunta
    };
  }
};
</script>

<style scoped>
/* Estilos personalizados para mejorar la interfaz */
body {
  font-family: 'Arial', sans-serif;
  background-color: #eaeef1;
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.pregunta-card {
  background-color: white;
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s;
}

.pregunta-card:hover {
  transform: translateY(-5px);
}

.pregunta-imagen {
  max-width: 100%;
  border-radius: 10px;
  margin-bottom: 10px;
}

.respostes-list {
  list-style-type: none;
  padding: 0;
}

.respostes-list li {
  padding: 5px 0;
  font-size: 16px;
}

.respuesta-correcta {
  color: #4caf50;
  font-weight: bold;
}

.button-group {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 10px 15px;
  margin-top: 10px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.3s, transform 0.2s;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}

.btn-edit {
  background-color: #4caf50;
  color: white;
}

.btn-delete {
  background-color: #f44336;
  color: white;
}

.btn-add {
  background-color: #008cba;
  color: white;
}

.btn-save {
  background-color: #ffa500;
  color: white;
}

.form-container {
  background-color: white;
  padding: 20px;
  margin-top: 20px;
  border-radius: 15px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.form-control {
  padding: 10px;
  margin-bottom: 15px;
  width: 100%;
  border-radius: 8px;
  border: 1px solid #ccc;
  box-sizing: border-box;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #008cba;
  outline: none;
}
</style>
