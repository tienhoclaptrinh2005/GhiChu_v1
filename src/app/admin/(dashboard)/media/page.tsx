import { CollectionPlaceholder } from "@/components/admin/collection-placeholder";
export default function AdminMediaPage() { return <CollectionPlaceholder title="Thư viện media" description="Metadata nằm trong PostgreSQL; object được lưu an toàn trên Cloudflare R2." features={["Upload bằng signed URL", "Kiểm tra MIME và dung lượng", "Public / Private", "Phát hiện file không còn dùng"]} />; }
