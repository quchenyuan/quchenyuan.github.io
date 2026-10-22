export interface Category {
  slug: string;
  title: string;
  description?: string;
}

// 数组顺序就是首页分类顺序；slug 发布后不要再改。
export const categories = [
  {
    slug: 'notes',
    title: '笔记',
    description: '日常记录与整理。',
  },
  {
    slug: 'typography',
    title: '排版',
    description: '中英混排、字体与阅读。',
  },
] satisfies Category[];

export function getCategory(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}
