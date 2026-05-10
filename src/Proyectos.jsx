import React, { useEffect, useState } from "react";
import axios from "axios";

const API_PROYECTOS = "http://localhost:8081/api/proyectos/proyecto";
const API_TAREAS = "http://localhost:8081/api/proyectos/tareas";

export default function Proyectos() {

  const [proyectos, setProyectos] = useState([]);
  const [tareas, setTareas] = useState([]);

  const [showProyectoModal, setShowProyectoModal] = useState(false);
  const [showTareasModal, setShowTareasModal] = useState(false);
  const [showTareaModal, setShowTareaModal] = useState(false);

  const [editandoProyecto, setEditandoProyecto] = useState(false);

  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null);

  const [formProyecto, setFormProyecto] = useState({
    nombre: "",
    descripcion: "",
    estado: "PENDIENTE",
    prioridad: "MEDIA",
    fecha_inicio: "",
    fecha_fin: ""
  });

  const [formTarea, setFormTarea] = useState({
    nombre: "",
    descripcion: "",
    estado: "PENDIENTE"
  });

  const fetchProyectos = async () => {
    try {
      const response = await axios.get(API_PROYECTOS);
      setProyectos(response.data);
    } catch (error) {
      console.error("Error al cargar proyectos:", error);
    }
  };

  useEffect(() => {
    fetchProyectos();
  }, []);

  const resetProyecto = () => {
    setFormProyecto({
      nombre: "",
      descripcion: "",
      estado: "PENDIENTE",
      prioridad: "MEDIA",
      fecha_inicio: "",
      fecha_fin: ""
    });
  };

  const resetTarea = () => {
    setFormTarea({
      nombre: "",
      descripcion: "",
      estado: "PENDIENTE"
    });
  };

  const abrirCrearProyecto = () => {
    resetProyecto();
    setEditandoProyecto(false);
    setShowProyectoModal(true);
  };

  const abrirEditarProyecto = (proyecto) => {
    setProyectoSeleccionado(proyecto);

    setFormProyecto({
      nombre: proyecto.nombre || "",
      descripcion: proyecto.descripcion || "",
      estado: proyecto.estado || "PENDIENTE",
      prioridad: proyecto.prioridad || "MEDIA",
      fecha_inicio: proyecto.fecha_inicio || "",
      fecha_fin: proyecto.fecha_fin || ""
    });

    setEditandoProyecto(true);
    setShowProyectoModal(true);
  };

  const guardarProyecto = async (e) => {
    e.preventDefault();

    try {

      if (editandoProyecto) {
        await axios.put(
          `${API_PROYECTOS}/${proyectoSeleccionado.idProyecto}`,
          formProyecto
        );
      } else {
        await axios.post(API_PROYECTOS, formProyecto);
      }

      fetchProyectos();
      setShowProyectoModal(false);

    } catch (error) {
      console.error(error);
      alert("Error al guardar proyecto");
    }
  };

  const eliminarProyecto = async (id) => {

    if (!window.confirm("¿Eliminar proyecto?")) return;

    try {
      await axios.delete(`${API_PROYECTOS}/${id}`);
      fetchProyectos();
    } catch (error) {
      alert("No se pudo eliminar el proyecto.");
    }
  };

  const verTareas = async (proyecto) => {

    setProyectoSeleccionado(proyecto);

    try {

      const response = await axios.get(
        `http://localhost:8081/api/proyectos/${proyecto.idProyecto}/tareas`
      );

      setTareas(response.data);
      setShowTareasModal(true);

    } catch (error) {
      console.error(error);
      alert("Error al cargar tareas.");
    }
  };

  const abrirCrearTarea = () => {
    resetTarea();
    setShowTareaModal(true);
    setEditandoTarea(false);
  };

const guardarTarea = async (e) => {

  e.preventDefault();

  try {

    if (editandoTarea) {

      await axios.put(
        `${API_TAREAS}/${tareaSeleccionada.idTarea}`,
        {
          ...formTarea,
          proyecto: {
            idProyecto: proyectoSeleccionado.idProyecto
          }
        }
      );

    } else {

      await axios.post(API_TAREAS, {
        ...formTarea,
        proyecto: {
          idProyecto: proyectoSeleccionado.idProyecto
        }
      });

    }

    const response = await axios.get(
      `http://localhost:8081/api/proyectos/${proyectoSeleccionado.idProyecto}/tareas`
    );

    setTareas(response.data);

    setShowTareaModal(false);
    setEditandoTarea(false);

  } catch (error) {

    console.error(error);
    alert("Error al guardar tarea.");

  }
};

  const [editandoTarea, setEditandoTarea] = useState(false);

const abrirEditarTarea = (tarea) => {

  setFormTarea({
    nombre: tarea.nombre || "",
    descripcion: tarea.descripcion || "",
    estado: tarea.estado || "PENDIENTE"
  });

  setProyectoSeleccionado(proyectoSeleccionado);
  setTareaSeleccionada(tarea);

  setEditandoTarea(true);
  setShowTareaModal(true);
};

const [tareaSeleccionada, setTareaSeleccionada] = useState(null);

const eliminarTarea = async (id) => {

  if (!window.confirm("¿Eliminar tarea?")) return;

  try {

    await axios.delete(`${API_TAREAS}/${id}`);

    const response = await axios.get(
      `http://localhost:8081/api/proyectos/${proyectoSeleccionado.idProyecto}/tareas`
    );

    setTareas(response.data);

  } catch (error) {

    console.error(error);
    alert("Error al eliminar tarea.");

  }
};

  return (
    <div className="container-fluid container-lg py-4">

      {/* HEADER */}

      <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-center mb-4 p-4 bg-white shadow-sm rounded-3 border-start border-4 border-primary gap-3">

        <div>
          <h2 className="text-dark fw-bold m-0 fs-4">
            Gestión de Proyectos
          </h2>

          <small
            className="text-muted text-uppercase fw-bold"
            style={{ fontSize: "10px" }}
          >
            Administración de proyectos y tareas
          </small>
        </div>

        <button
          className="btn btn-primary btn-sm px-4 fw-bold shadow-sm"
          onClick={abrirCrearProyecto}
        >
          + Nuevo Proyecto
        </button>
      </div>

      {/* TABLA */}

      <div className="card shadow-lg rounded-4 overflow-hidden">

        <div className="table-responsive">

          <table
            className="table table-hover align-middle mb-0"
            style={{ minWidth: "1000px" }}
          >

            <thead className="bg-dark text-white">

              <tr>
                <th className="ps-4 py-3">PROYECTO</th>
                <th>ESTADO</th>
                <th>PRIORIDAD</th>
                <th>INICIO</th>
                <th>FIN</th>
                <th className="text-end pe-4">ACCIONES</th>
              </tr>

            </thead>

            <tbody>

              {proyectos.map((p) => (

                <tr key={p.idProyecto}>

                  <td className="ps-4">

                    <div>
                      <div className="fw-bold text-dark">
                        {p.nombre}
                      </div>

                      <small className="text-muted">
                        {p.descripcion}
                      </small>
                    </div>

                  </td>

                  <td>

                    <span className="badge bg-primary-subtle text-primary border px-3 py-2">
                      {p.estado}
                    </span>

                  </td>

                  <td>

                    <span className="badge bg-warning-subtle text-dark border px-3 py-2">
                      {p.prioridad}
                    </span>

                  </td>

                  <td className="small text-muted">
                    {p.fecha_inicio}
                  </td>

                  <td className="small text-muted">
                    {p.fecha_fin}
                  </td>

                  <td className="text-end pe-4">

                    <div className="d-flex justify-content-end gap-1">

                      <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => verTareas(p)}
                      >
                        📋
                      </button>

                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => abrirEditarProyecto(p)}
                      >
                        ✎
                      </button>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => eliminarProyecto(p.idProyecto)}
                      >
                        ×
                      </button>

                    </div>

                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

      {/* MODAL PROYECTO */}

      {showProyectoModal && (

        <>
          <div className="modal-backdrop fade show" />

          <div className="modal d-block">

            <div className="modal-dialog modal-lg modal-dialog-centered">

              <form
                className="modal-content border-0 shadow-lg"
                onSubmit={guardarProyecto}
              >

                <div className={`modal-header ${editandoProyecto ? "bg-warning" : "bg-primary text-white"}`}>

                  <h5 className="modal-title fw-bold">

                    {editandoProyecto
                      ? "Editar Proyecto"
                      : "Nuevo Proyecto"}

                  </h5>

                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => setShowProyectoModal(false)}
                  />

                </div>

                <div className="modal-body p-4">

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">
                      NOMBRE
                    </label>

                    <input
                      className="form-control"
                      value={formProyecto.nombre}
                      onChange={(e) =>
                        setFormProyecto({
                          ...formProyecto,
                          nombre: e.target.value
                        })
                      }
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted">
                      DESCRIPCIÓN
                    </label>

                    <textarea
                      className="form-control"
                      rows="3"
                      value={formProyecto.descripcion}
                      onChange={(e) =>
                        setFormProyecto({
                          ...formProyecto,
                          descripcion: e.target.value
                        })
                      }
                    />
                  </div>

                  <div className="row g-3">

                    <div className="col-md-6">

                      <label className="form-label small fw-bold text-muted">
                        ESTADO
                      </label>

                      <select
                        className="form-select"
                        value={formProyecto.estado}
                        onChange={(e) =>
                          setFormProyecto({
                            ...formProyecto,
                            estado: e.target.value
                          })
                        }
                      >
                        <option>PENDIENTE</option>
                        <option>EN_PROCESO</option>
                        <option>FINALIZADO</option>
                      </select>

                    </div>

                    <div className="col-md-6">

                      <label className="form-label small fw-bold text-muted">
                        PRIORIDAD
                      </label>

                      <select
                        className="form-select"
                        value={formProyecto.prioridad}
                        onChange={(e) =>
                          setFormProyecto({
                            ...formProyecto,
                            prioridad: e.target.value
                          })
                        }
                      >
                        <option>BAJA</option>
                        <option>MEDIA</option>
                        <option>ALTA</option>
                      </select>

                    </div>

                    <div className="col-md-6">

                      <label className="form-label small fw-bold text-muted">
                        FECHA INICIO
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={formProyecto.fecha_inicio}
                        onChange={(e) =>
                          setFormProyecto({
                            ...formProyecto,
                            fecha_inicio: e.target.value
                          })
                        }
                      />

                    </div>

                    <div className="col-md-6">

                      <label className="form-label small fw-bold text-muted">
                        FECHA FIN
                      </label>

                      <input
                        type="date"
                        className="form-control"
                        value={formProyecto.fecha_fin}
                        onChange={(e) =>
                          setFormProyecto({
                            ...formProyecto,
                            fecha_fin: e.target.value
                          })
                        }
                      />

                    </div>

                  </div>

                </div>

                <div className="modal-footer bg-light border-0">

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowProyectoModal(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className={`btn btn-sm ${editandoProyecto ? "btn-warning" : "btn-primary"} fw-bold`}
                  >
                    {editandoProyecto ? "Actualizar" : "Crear"}
                  </button>

                </div>

              </form>

            </div>

          </div>
        </>

      )}

      {/* MODAL TAREAS */}

      {showTareasModal && (

        <>
          <div className="modal-backdrop fade show" />

          <div className="modal d-block">

            <div className="modal-dialog modal-xl modal-dialog-centered">

              <div className="modal-content border-0 shadow-lg">

                <div className="modal-header bg-dark text-white">

                  <div>

                    <h5 className="modal-title fw-bold">
                      Tareas del Proyecto
                    </h5>

                    <small>
                      {proyectoSeleccionado?.nombre}
                    </small>

                  </div>

                  <div className="d-flex gap-2">

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={abrirCrearTarea}
                    >
                      + Agregar Tarea
                    </button>

                    <button
                      className="btn-close btn-close-white"
                      onClick={() => setShowTareasModal(false)}
                    />

                  </div>

                </div>

                <div className="modal-body p-0">

                  <table className="table table-hover mb-0">

                    <thead className="table-light">

                        <tr>
                            <th className="ps-4">TAREA</th>
                            <th>ESTADO</th>
                            <th className="text-end pe-4">ACCIONES</th>
                        </tr>

                    </thead>

                    <tbody>

                        {tareas.length > 0 ? (

                            tareas.map((t) => (

                            <tr key={t.idTarea}>

                                <td className="ps-4">

                                <div className="fw-bold">
                                    {t.nombre}
                                </div>

                                <small className="text-muted">
                                    {t.descripcion}
                                </small>

                                </td>

                                <td>

                                <span className={`badge px-3 py-2 border ${
                                    t.estado === "FINALIZADO"
                                    ? "bg-success-subtle text-success"
                                    : t.estado === "EN_PROCESO"
                                    ? "bg-warning-subtle text-dark"
                                    : "bg-secondary-subtle text-secondary"
                                }`}>
                                    {t.estado}
                                </span>

                                </td>

                                <td className="text-end pe-4">

                                <div className="d-flex justify-content-end gap-2">

                                    <button
                                    className="btn btn-sm btn-outline-warning"
                                    onClick={() => abrirEditarTarea(t)}
                                    >
                                    ✎
                                    </button>

                                    <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => eliminarTarea(t.idTarea)}
                                    >
                                    ×
                                    </button>

                                </div>

                                </td>

                            </tr>

                            ))

                        ) : (

                            <tr>

                            <td
                                colSpan="3"
                                className="text-center py-4 text-muted"
                            >
                                No hay tareas registradas.
                            </td>

                            </tr>

                        )}

                    </tbody>

                  </table>

                </div>

              </div>

            </div>

          </div>
        </>

      )}

      {/* MODAL CREAR TAREA */}

      {showTareaModal && (

        <>
          <div className="modal-backdrop fade show" />

          <div className="modal d-block">

            <div className="modal-dialog modal-dialog-centered">

              <form
                className="modal-content border-0 shadow-lg"
                onSubmit={guardarTarea}
              >

                <div className="modal-header bg-primary text-white">

                  <h5 className="modal-title fw-bold">
                    Nueva Tarea
                  </h5>

                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowTareaModal(false)}
                  />

                </div>

                <div className="modal-body p-4">

                  <div className="mb-3">

                    <label className="form-label small fw-bold text-muted">
                      NOMBRE
                    </label>

                    <input
                      className="form-control"
                      value={formTarea.nombre}
                      onChange={(e) =>
                        setFormTarea({
                          ...formTarea,
                          nombre: e.target.value
                        })
                      }
                      required
                    />

                  </div>

                  <div className="mb-3">

                    <label className="form-label small fw-bold text-muted">
                      DESCRIPCIÓN
                    </label>

                    <textarea
                      className="form-control"
                      rows="3"
                      value={formTarea.descripcion}
                      onChange={(e) =>
                        setFormTarea({
                          ...formTarea,
                          descripcion: e.target.value
                        })
                      }
                    />

                  </div>

                  <div>

                    <label className="form-label small fw-bold text-muted">
                      ESTADO
                    </label>

                    <select
                      className="form-select"
                      value={formTarea.estado}
                      onChange={(e) =>
                        setFormTarea({
                          ...formTarea,
                          estado: e.target.value
                        })
                      }
                    >
                      <option>PENDIENTE</option>
                      <option>EN_PROCESO</option>
                      <option>FINALIZADO</option>
                    </select>

                  </div>

                </div>

                <div className="modal-footer bg-light border-0">

                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowTareaModal(false)}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn btn-primary btn-sm fw-bold"
                  >
                    Crear Tarea
                  </button>

                </div>

              </form>

            </div>

          </div>
        </>

      )}

    </div>
  );
}