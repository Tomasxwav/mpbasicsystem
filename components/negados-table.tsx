import { deniedProducts } from '@/mocks/productos-negados';

const NegadosTable = () => {
  return (
    <div className="w-full">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Productos Negados</h2>
        <p className="text-sm text-gray-500">No disponibles para venta en MercadoLibre</p>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr className="bg-mercadolibre">
              {['SKU', 'Nombre', 'Disponibilidad', 'Cant. Negada', 'Motivo', 'Fecha'].map((col) => (
                <th
                  key={col}
                  className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-700"
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {deniedProducts.map((product, i) => (
              <tr
                key={product.sku}
                className={`transition-colors hover:bg-yellow-50 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
              >
                <td className="px-4 py-3 text-sm font-mono font-medium text-gray-900">
                  {product.sku}
                </td>
                <td className="px-4 py-3 text-sm text-gray-800">{product.name}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      (product.availability ?? 0) > 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {(product.availability ?? 0) > 0 ? 'Disponible' : 'Sin stock'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-red-600">
                  {product.deniedQuantity}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{product.reason}</td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {new Date(product.date).toLocaleDateString('es-MX', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-400">
          {deniedProducts.length} producto{deniedProducts.length !== 1 ? 's' : ''} negado{deniedProducts.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
};

export default NegadosTable;
