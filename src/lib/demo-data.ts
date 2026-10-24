import type {
  CategorySummary,
  NoteDetail,
  NoteSummary,
  PageBlock,
  SiteSettings,
} from "@/types/domain";

export const demoSiteSettings: SiteSettings = {
  displayName: "Minh An",
  headline: "Ghi lại điều hữu ích. Chia sẻ điều đáng nhớ.",
  description:
    "Một góc nhỏ dành cho ghi chú công nghệ, tài nguyên thực hành và những liên kết mình thường xuyên sử dụng.",
  avatarMediaId: null,
  avatarUrl: null,
  backgroundMediaId: null,
  backgroundImageUrl: null,
  theme: { accent: "#5b5cf0", radius: "rounded", mode: "light" },
  socialLinks: [
    { label: "Facebook", href: "https://facebook.com", icon: "facebook" },
    { label: "Telegram", href: "https://telegram.org", icon: "send" },
    { label: "Email", href: "mailto:hello@example.com", icon: "mail" },
  ],
};

export const demoCategories: CategorySummary[] = [
  {
    id: "cat-nextjs",
    name: "Next.js",
    slug: "nextjs",
    description: "App Router, Server Components và cách đưa ứng dụng lên production.",
    color: "#5b5cf0",
    noteCount: 2,
  },
  {
    id: "cat-backend",
    name: "Backend",
    slug: "backend",
    description: "Thiết kế API, cơ sở dữ liệu và bảo mật phía server.",
    color: "#0f9f75",
    noteCount: 1,
  },
  {
    id: "cat-tools",
    name: "Công cụ",
    slug: "cong-cu",
    description: "Quy trình và công cụ giúp làm việc gọn hơn mỗi ngày.",
    color: "#e9753d",
    noteCount: 1,
  },
];

export const demoNotes: NoteSummary[] = [
  {
    id: "note-1",
    title: "Bắt đầu dự án Next.js theo cách dễ bảo trì",
    slug: "bat-dau-du-an-nextjs",
    excerpt:
      "Một cấu trúc thực tế cho App Router: tách route, domain, hạ tầng và component để dự án lớn lên không bị rối.",
    status: "PUBLIC",
    isPinned: true,
    publishedAt: "2026-10-12T08:00:00.000Z",
    updatedAt: "2026-10-12T08:00:00.000Z",
    readingTimeMinutes: 6,
    viewCount: 128,
    categories: [demoCategories[0]],
  },
  {
    id: "note-2",
    title: "Checklist bảo mật Supabase cho ứng dụng cá nhân",
    slug: "checklist-bao-mat-supabase",
    excerpt:
      "RLS, service role, kiểm tra quyền phía server và những lỗi cấu hình phổ biến cần rà soát trước khi public.",
    status: "PUBLIC",
    isPinned: true,
    publishedAt: "2026-10-08T08:00:00.000Z",
    updatedAt: "2026-10-10T08:00:00.000Z",
    readingTimeMinutes: 8,
    viewCount: 94,
    categories: [demoCategories[1]],
  },
  {
    id: "note-3",
    title: "Bộ công cụ mình dùng để ghi chú và học tập",
    slug: "bo-cong-cu-ghi-chu",
    excerpt:
      "Cách mình gom tài liệu, đặt tên ghi chú và duy trì một hệ thống nhỏ nhưng tìm lại được mọi thứ.",
    status: "PUBLIC",
    isPinned: false,
    publishedAt: "2026-10-02T08:00:00.000Z",
    updatedAt: "2026-10-02T08:00:00.000Z",
    readingTimeMinutes: 4,
    viewCount: 63,
    categories: [demoCategories[2]],
  },
  {
    id: "note-4",
    title: "Cache và revalidation trong App Router",
    slug: "cache-va-revalidation-app-router",
    excerpt:
      "Phân biệt dữ liệu tĩnh, dữ liệu theo request và cách làm mới cache sau khi Admin xuất bản nội dung.",
    status: "PUBLIC",
    isPinned: false,
    publishedAt: "2026-09-25T08:00:00.000Z",
    updatedAt: "2026-09-28T08:00:00.000Z",
    readingTimeMinutes: 7,
    viewCount: 51,
    categories: [demoCategories[0]],
  },
];

export const demoNoteDetails: Record<string, NoteDetail> = Object.fromEntries(
  demoNotes.map((note) => [
    note.slug,
    {
      ...note,
      versionNumber: 1,
      seoTitle: null,
      seoDescription: null,
      content: {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Ghi chú này minh họa cách nội dung Tiptap JSON được lưu trong PostgreSQL và render an toàn ở trang công khai.",
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Tư duy chính" }],
          },
          {
            type: "bulletList",
            content: [
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Giữ route mỏng và đưa nghiệp vụ vào feature module." },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Kiểm tra quyền ở server và thêm RLS như lớp bảo vệ thứ hai." },
                    ],
                  },
                ],
              },
              {
                type: "listItem",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Tách bản nháp khỏi phiên bản đang công khai." },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "blockquote",
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Một hệ thống tốt giúp việc cập nhật nội dung trở nên bình thường, không phải một lần triển khai mới.",
                  },
                ],
              },
            ],
          },
          {
            type: "heading",
            attrs: { level: 2 },
            content: [{ type: "text", text: "Bước tiếp theo" }],
          },
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Kết nối Supabase, chạy migration và thay dữ liệu demo bằng các truy vấn đã có sẵn trong thư mục features.",
              },
            ],
          },
        ],
      },
    },
  ]),
);

export const demoHomeBlocks: PageBlock[] = [
  {
    id: "block-links",
    type: "BUTTON",
    name: "Liên kết nhanh",
    content: {
      layout: "stack",
      items: [
        {
          title: "Nhóm cộng đồng",
          description: "Trao đổi và cập nhật tài nguyên mới",
          href: "https://telegram.org",
          icon: "message-circle",
          tone: "blue",
          external: true,
        },
        {
          title: "Tất cả ghi chú",
          description: "Duyệt theo chủ đề hoặc tìm kiếm",
          href: "/notes",
          icon: "notebook-tabs",
          tone: "violet",
          external: false,
        },
        {
          title: "Danh mục",
          description: "Đi thẳng đến chủ đề bạn quan tâm",
          href: "/categories",
          icon: "folder-tree",
          tone: "orange",
          external: false,
        },
        {
          title: "Tìm kiếm",
          description: "Tìm nhanh một ghi chú hoặc từ khóa",
          href: "/search",
          icon: "search",
          tone: "rose",
          external: false,
        },
      ],
    },
    styles: {},
    position: 0,
    isActive: true,
  },
  {
    id: "block-notes",
    type: "NOTE_LIST",
    name: "Ghi chú nổi bật",
    content: {
      title: "Ghi chú nổi bật",
      description: "4 ghi chú công khai được ghim gần nhất.",
      limit: 4,
    },
    styles: {},
    position: 1,
    isActive: true,
  },
];
