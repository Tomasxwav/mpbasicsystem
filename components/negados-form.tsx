import { MercadoLibreItem } from '@/types/meli-item';

type NegadosFormProps = {
  isEditing?: boolean;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  product?: MercadoLibreItem;
};

export default function NegadosForm({
  isEditing = false,
  onSubmit,
  onCancel,
  product
}: NegadosFormProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800">{isEditing ? 'Editar' : 'Agregar'} Producto Negado</h1>
    </div>
  )
}