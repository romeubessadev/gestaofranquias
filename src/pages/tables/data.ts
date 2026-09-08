export interface EmployeeRow {
  id: number;
  name: string;
  email: string;
  dept: string;
  role: string;
  status: string;
  salary: string;
  joined: string;
  rating: number;
}

export const employees: EmployeeRow[] = [
  { id: 1, name: "Marcus Liu", email: "marcus@vela.io", dept: "Engineering", role: "Staff Engineer", status: "Active", salary: "$142,000", joined: "Mar 12, 2022", rating: 5 },
  { id: 2, name: "Elena Park", email: "elena@vela.io", dept: "Sales", role: "VP Sales", status: "Active", salary: "$168,500", joined: "Jan 4, 2021", rating: 5 },
  { id: 3, name: "David Chen", email: "david@vela.io", dept: "Design", role: "Product Designer", status: "On leave", salary: "$118,200", joined: "Jul 19, 2022", rating: 4 },
  { id: 4, name: "Sarah Kim", email: "sarah@vela.io", dept: "Marketing", role: "Growth Lead", status: "Active", salary: "$104,900", joined: "Sep 2, 2023", rating: 4 },
  { id: 5, name: "James Wright", email: "james@vela.io", dept: "Engineering", role: "Backend Engineer", status: "Active", salary: "$128,700", joined: "Nov 28, 2023", rating: 3 },
  { id: 6, name: "Priya Nair", email: "priya@vela.io", dept: "Finance", role: "Financial Analyst", status: "Inactive", salary: "$96,400", joined: "Feb 14, 2020", rating: 3 },
  { id: 7, name: "Tom Baxter", email: "tom@vela.io", dept: "Support", role: "Support Lead", status: "Active", salary: "$88,300", joined: "May 30, 2024", rating: 5 },
  { id: 8, name: "Nina Torres", email: "nina@vela.io", dept: "Engineering", role: "Frontend Engineer", status: "Active", salary: "$121,600", joined: "Aug 8, 2023", rating: 4 },
  { id: 9, name: "Omar Farouk", email: "omar@vela.io", dept: "Sales", role: "Account Executive", status: "On leave", salary: "$99,800", joined: "Oct 17, 2022", rating: 3 },
  { id: 10, name: "Grace Liu", email: "grace@vela.io", dept: "Design", role: "UX Researcher", status: "Active", salary: "$107,300", joined: "Apr 25, 2024", rating: 4 },
];

export interface ProductRow {
  emoji: string;
  name: string;
  cat: string;
  price: string;
  stock: number;
}

export const products: ProductRow[] = [
  { emoji: "🎧", name: "Wireless Headphones", cat: "Audio", price: "$129.00", stock: 42 },
  { emoji: "⌚", name: "Smart Watch Pro", cat: "Wearables", price: "$249.00", stock: 6 },
  { emoji: "💻", name: "Ultrabook 14\"", cat: "Computers", price: "$1,299.00", stock: 18 },
  { emoji: "📷", name: "Mirrorless Camera", cat: "Photography", price: "$899.00", stock: 3 },
  { emoji: "🖱️", name: "Ergonomic Mouse", cat: "Accessories", price: "$59.00", stock: 74 },
  { emoji: "🔌", name: "USB-C Hub", cat: "Accessories", price: "$39.00", stock: 8 },
];
