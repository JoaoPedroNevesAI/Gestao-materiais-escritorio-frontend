export default function Formulario({ aoAdicionar }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const nome = e.target.nome.value;
    const qtd = e.target.qtd.value;
    
    if (nome && qtd) {
      aoAdicionar(nome, parseInt(qtd));
      e.target.reset(); 
    }
  };

  return (
    <fieldset className="win95-fieldset">
      <legend>Novo Registro</legend>
      <form onSubmit={handleSubmit} className="win95-form">
        <div className="input-group">
          <label>Nome:</label>
          <input name="nome" type="text" />
        </div>
        <div className="input-group">
          <label>Qtd:</label>
          <input name="qtd" type="number" />
        </div>
        <button type="submit" className="win95-btn">Registrar</button>
      </form>
    </fieldset>
  );
}