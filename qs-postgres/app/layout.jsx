import './globals.css';
import 'leaflet/dist/leaflet.css';
import { ShopProvider } from '../context/ShopContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
export const metadata = {title:'QuickShop — Shop Smart. Get Fast.',description:'Shop groceries, household products and electronics.'};
export default function RootLayout({children}){return <html lang="en"><body><ShopProvider><Header/><main>{children}</main><Footer/><Toast/></ShopProvider></body></html>}
import Toast from '../components/Toast';
