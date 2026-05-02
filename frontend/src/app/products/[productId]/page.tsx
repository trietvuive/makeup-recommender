import { notFound } from "next/navigation";
import ProductPageClient from "./ProductPageClient";

interface Props {
  params: Promise<{ productId: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { productId: rawProductId } = await params;
  if (!/^\d+$/.test(rawProductId)) {
    notFound();
  }

  return <ProductPageClient productId={Number(rawProductId)} />;
}
