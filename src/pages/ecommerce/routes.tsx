import { lazyPage } from "@/lib/lazyPage";
import type { RouteObject } from "react-router-dom";
import { paths } from "@/router/paths";
const OrdersOverview = lazyPage(() => import("./OrdersOverview"), "OrdersOverview");
const EcommerceDashboard = lazyPage(() => import("./EcommerceDashboard"), "EcommerceDashboard");
const ProductGrid = lazyPage(() => import("./ProductGrid"), "ProductGrid");
const ProductList = lazyPage(() => import("./ProductList"), "ProductList");
const ProductDetails = lazyPage(() => import("./ProductDetails"), "ProductDetails");
const AddProduct = lazyPage(() => import("./AddProduct"), "AddProduct");
const EditProduct = lazyPage(() => import("./EditProduct"), "EditProduct");
const ProductCategories = lazyPage(() => import("./ProductCategories"), "ProductCategories");
const OrdersList = lazyPage(() => import("./OrdersList"), "OrdersList");
const OrderDetails = lazyPage(() => import("./OrderDetails"), "OrderDetails");
const CreateOrder = lazyPage(() => import("./CreateOrder"), "CreateOrder");
const CustomersList = lazyPage(() => import("./CustomersList"), "CustomersList");
const CustomerDetails = lazyPage(() => import("./CustomerDetails"), "CustomerDetails");
const CustomerAnalytics = lazyPage(() => import("./CustomerAnalytics"), "CustomerAnalytics");
const Reviews = lazyPage(() => import("./Reviews"), "Reviews");
const Inventory = lazyPage(() => import("./Inventory"), "Inventory");
const Coupons = lazyPage(() => import("./Coupons"), "Coupons");
const Wishlist = lazyPage(() => import("./Wishlist"), "Wishlist");
const Promotions = lazyPage(() => import("./Promotions"), "Promotions");

export const ecommerceRoutes: RouteObject[] = [
  { path: paths.orders.overview, element: <OrdersOverview /> },
  { path: paths.dashboards.ecommerce, element: <EcommerceDashboard /> },
  { path: paths.ecommerce.productGrid, element: <ProductGrid /> },
  { path: paths.ecommerce.productList, element: <ProductList /> },
  { path: paths.ecommerce.productDetail(), element: <ProductDetails /> },
  { path: paths.ecommerce.productNew, element: <AddProduct /> },
  { path: paths.ecommerce.productEdit(), element: <EditProduct /> },
  { path: paths.ecommerce.categories, element: <ProductCategories /> },
  { path: paths.ecommerce.ordersList, element: <OrdersList /> },
  { path: paths.ecommerce.orderDetail(), element: <OrderDetails /> },
  { path: paths.ecommerce.orderNew, element: <CreateOrder /> },
  { path: paths.ecommerce.customersList, element: <CustomersList /> },
  { path: paths.ecommerce.customerDetail(), element: <CustomerDetails /> },
  { path: paths.ecommerce.customerAnalytics, element: <CustomerAnalytics /> },
  { path: paths.ecommerce.reviews, element: <Reviews /> },
  { path: paths.ecommerce.inventory, element: <Inventory /> },
  { path: paths.ecommerce.coupons, element: <Coupons /> },
  { path: paths.ecommerce.wishlist, element: <Wishlist /> },
  { path: paths.ecommerce.promotions, element: <Promotions /> },
];
