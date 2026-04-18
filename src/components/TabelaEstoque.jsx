export default function TabelaEstoque({ materiais, aoRemover, podeEditar }) {

  const formatarValor = (valor) => {
    if (valor == null) return '—';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Nome / Descrição</th>
          <th>Categoria</th>
          <th>Local</th>
          <th>Valor</th>
          {podeEditar && <th>Ações</th>}
        </tr>
      </thead>

      <tbody>
        {materiais.length === 0 ? (
          <tr>
            <td colSpan={5} style={{ textAlign: 'center' }}>
              Nenhum item encontrado.
            </td>
          </tr>
        ) : (
          materiais.map(item => (
            <tr key={item.id}>
              
              <td>
                <strong>{item.nome}</strong>
                <div>{item.descricao || 'Sem descrição'}</div>
              </td>

              <td>
                {item.categoria?.nome || '—'}
              </td>

              <td>
                {item.local || '—'}
              </td>

              <td>
                R$ {formatarValor(item.valor)}
              </td>

              {podeEditar && (
                <td>
                  <button onClick={() => aoRemover(item.id)}>
                    Dar Baixa
                  </button>
                </td>
              )}

            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}