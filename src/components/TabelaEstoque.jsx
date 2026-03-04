export default function TabelaEstoque({ materiais, aoAlterar, aoRemover }) {
  return (
    <table className="win95-table">
      <thead>
        <tr>
          <th>Material</th>
          <th>Estoque</th>
          <th>Ações</th>
        </tr>
      </thead>
      <tbody>
        {materiais.map(item => (
          <tr key={item.id}>
            <td className={item.quantidade < 3 ? 'low-stock' : ''}>
              {item.nome} {item.quantidade < 3 && "(!)"}
            </td>
            <td>{item.quantidade}</td>
            <td>
              <button className="win95-btn small" onClick={() => aoAlterar(item.id, 1)}>+</button>
              <button className="win95-btn small" onClick={() => aoAlterar(item.id, -1)}>-</button>
              <button className="win95-btn small delete" onClick={() => aoRemover(item.id)}>DEL</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}