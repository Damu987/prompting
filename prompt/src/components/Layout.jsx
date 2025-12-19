import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { Outlet, useLocation } from "react-router-dom";

export default function Layout(){
    const location = useLocation();

    const hideFooterRoutes = ["/prompting"];
    const hideFooter = hideFooterRoutes.includes(location.pathname);
    return(

        <div className="layout">
            <Navbar />
             <div className="content">
               <Outlet />
            </div>
            {!hideFooter && <Footer />}
        </div>
    )
}