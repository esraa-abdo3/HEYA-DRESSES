
import Navbar from "../componets/navabar/Navbar";
import Header from "../componets/Header/Header";
import Footer from "../componets/Footer/Footer";

export default function WebsiteLayout({ children }) {
  return (
    <>
      <Header />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}