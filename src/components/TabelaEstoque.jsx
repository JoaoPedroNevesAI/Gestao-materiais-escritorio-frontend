export default function TabelaEstoque({ materiais, aoRemover, podeEditar }) {

  const formatarValor = (valor) => {
    if (valor == null) return '—';
    return valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  return (
    <table>
      <thead>
        <tr>
          <th>Imagem</th>
          <th>Nome / Descrição</th>
          <th>Categoria</th>
          <th>Local</th>
          <th>Valor</th>
          {podeEditar && <th style={{ textAlign: 'center' }}>Ações</th>}
        </tr>
      </thead>

      <tbody>
        {materiais.length === 0 ? (
          <tr>
            <td colSpan={podeEditar ? 6 : 5} style={{ textAlign: 'center', padding: '20px', color: '#999' }}>
              Nenhum patrimônio encontrado.
            </td>
          </tr>
        ) : (
          materiais.map(item => {
            // A lógica de "permitirAcao" agora depende apenas da prop geral podeEditar
            const permitirAcao = podeEditar;

            return (
              <tr key={item.id}>
                <td>
                  {item.imagemUrl ? (
                    <img 
                      src={item.imagemUrl}
                      alt={item.nome}
                      onError={(e) => e.target.src = 'https://placeholder.com'}
                      style={{ 
                        width: '50px',
                        height: '50px',
                        objectFit: 'cover',
                        borderRadius: '6px'
                      }}
                    />
                  ) : '—'}
                </td>

                <td>
                  <div style={{ fontWeight: '600', color: '#1a73e8' }}>
                    {item.nome || 'Sem nome'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#5f6368', marginTop: '4px' }}>
                    {item.descricao || "Sem descrição adicional"}
                  </div>
                </td>

                <td>
                  <span style={{
                    backgroundColor: '#e8f0fe',
                    color: '#1a73e8',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase'
                  }}>
                    {item.categoria?.nome || '—'}
                  </span>
                </td>

                <td>
                  {item.local || '—'}
                </td>

                <td style={{ fontWeight: '500' }}>
                  R$ {formatarValor(item.valor)}
                </td>

                {podeEditar && (
                  <td style={{ textAlign: 'center' }}>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => aoRemover(item.id)}
                      style={{ padding: '5px 10px', fontSize: '12px' }}
                    >
                      Dar Baixa
                    </button>
                  </td>
                )}
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
}
