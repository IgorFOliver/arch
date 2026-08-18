import type { Meta, StoryObj } from '@storybook/react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataTable, DataTableFeatures, DataTableProps } from './DataTable';

interface Product {
  name: string;
  category: string;
  price: number;
}

// Storybook's `Meta<typeof DataTable<Product>>` can't reliably instantiate a
// generic component's type parameter — it falls back to the `RowData`
// constraint, which then rejects `Product`-typed args. A concrete wrapper
// sidesteps the issue entirely.
function ProductDataTable(props: DataTableProps<Product>) {
  return <DataTable {...props} />;
}

const products: Product[] = [
  { name: 'Oak Bookcase', category: 'Bookcases', price: 420 },
  { name: 'Walnut Sideboard', category: 'Storage', price: 680 },
  { name: 'Pine Shelf Unit', category: 'Bookcases', price: 210 },
  { name: 'Maple Cabinet', category: 'Storage', price: 540 },
  { name: 'Cedar Bench', category: 'Seating', price: 190 },
  { name: 'Ash Bookcase', category: 'Bookcases', price: 390 },
  { name: 'Birch Stool', category: 'Seating', price: 95 },
];

const columns: ColumnDef<DataTableFeatures, Product, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'category', header: 'Category' },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ getValue }) => `$${getValue<number>()}`,
  },
];

const meta = {
  title: 'atomic/Organisms/DataTable',
  component: ProductDataTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<typeof ProductDataTable>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    columns,
    data: products,
    pageSize: 3,
    noResultsLabel: 'No results.',
    previousLabel: 'Previous',
    nextLabel: 'Next',
    pageLabel: (currentPage, totalPages) =>
      `Page ${currentPage} of ${totalPages}`,
  },
};
