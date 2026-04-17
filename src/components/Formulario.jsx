export default function Formulario({ aoAdicionar }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const dados = Object.fromEntries(fd);

    aoAdicionar(
      dados.nome, 
      dados.valor, 
      dados.descricao, 
      dados.local, 
      dados.categoria
    );
    e.target.reset();
  };

  return (
    <section className="card">
      <h3>Cadastrar Novo Bem Patrimonial</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <input 
          name="nome" 
          placeholder="Nome do Bem (Ex: Notebook Dell)" 
          required 
          style={{ gridColumn: 'span 2' }} 
        />
        
        <input name="valor" type="number" placeholder="Valor de Aquisição" required />
        
        <select name="categoria" required>
          <option value="">Selecione a Categoria</option>
          <option value="Informática">Informática</option>
          <option value="Mobiliário">Mobiliário</option>
          <option value="Eletrodomésticos">Eletrodomésticos</option>
          <option value="Ferramentas">Ferramentas</option>
        </select>

        <select name="local" required>
          <option value="">Selecione o Setor/Local</option>
          <option value="Recepção">Recepção</option>
          <option value="Escritório">Escritório</option>
          <option value="TI">Departamento de TI</option>
          <option value="Almoxarifado">Almoxarifado</option>
        </select>

        <textarea 
          name="descricao" 
          placeholder="Descrição/Especificações Técnicas" 
          style={{ gridColumn: 'span 2', padding: '10px' }} 
        />
        
        <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>
          Registrar Patrimônio
        </button>
      </form>
    </section>
  );
}