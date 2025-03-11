import { useState, useEffect } from "react";
import { Client } from "@stomp/stompjs";
import "./App.css";
import { listaColores } from "./components/colores/Informacion";

function App() {
  const [stompCliente, setStompCliente] = useState(null);
  const [mensajes, setmensajes] = useState([]);
  const [nombre, setnombre] = useState("");
  const [mensaje, setmensaje] = useState("");

  useEffect(() => {
    setmensaje("");
    setnombre("");
    const cliente = new Client({
      brokerURL: "ws://localhost:8080/websocket",
    });
    cliente.onConnect = () => {
      cliente.subscribe("/tema/mensajes", (mensaje) => {
        const nuevoMsg = JSON.parse(mensaje.body);
        setmensajes((p) => [...p, nuevoMsg]);
      });
    };

    cliente.activate();
    setStompCliente(cliente);
    return () => {
      if (cliente) {
        cliente.deactivate();
      }
    };
  }, []);

  const enviarMensaje = () => {
    if (stompCliente != null && nombre !== "" && mensaje !== "") {
      const color = getColorByName(nombre);
      stompCliente.publish({
        destination: "/app/envio",
        body: JSON.stringify({
          nombre: nombre,
          contenido: mensaje,
          color: color
        }),
      });
      setmensaje("");
    }
  };

  // Función para obtener un color aleatorio basado en el nombre
  const getColorByName = (nombre) => {
    const listaC = listaColores;
    const index = nombre.length % listaC.length; // Puedes usar un cálculo diferente si prefieres
    return listaC[index];
  };

  return (
    <main className="contenedor_mjs pt-5" >
      <div className="border p-3 rounded-3 contenedor_msj_chat">
        <h3 className="text-center pt-1 pb-4 text-uppercase">proyecto con <strong>web socket</strong></h3>
        <article className="row">
          <section className="col">
            <section className="form-floating">
              <input
                value={nombre}
                onChange={(e) => setnombre(e.target.value)}
                id="textNombre"
                type="text"
                className="form-control"
                placeholder="nombre"
              />
              <label htmlFor="textNombre">Nombre</label>
            </section>
          </section>
          <section className="col-6">
            <section className="form-floating">
              <input
                value={mensaje}
                onChange={(e) => setmensaje(e.target.value)}
                id="textMensaje"
                type="text"
                className="form-control"
              />
              <label htmlFor="textMensaje">Mensaje</label>
            </section>
          </section>
          <section className="col d-grid">
            <button onClick={enviarMensaje} className="btn btn-success">
              Enviar
            </button>
          </section>
        </article>
        <article className="contenedor_msj row mt-4 pt-4 border rounded-3">
          <article className="col-12">
            {mensajes.map((msg, i) => (
              <p
                key={i}
                className="p-2 border-info-subtle rounded-2"
                style={{ backgroundColor: msg.color }}
              >
                <b>{msg.nombre}</b> {msg.contenido}
              </p>
            ))}
          </article>
        </article>
      </div>
    </main>
  );
}

export default App;