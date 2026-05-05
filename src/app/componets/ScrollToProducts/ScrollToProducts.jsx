"use client"
export default function ScrollToProducts() {
    const handleScroll = () => {
        document.getElementById("products-section")?.scrollIntoView({ 
            behavior: "smooth" 
        });
    };

    return (
        <button className="btn-outline" onClick={handleScroll}>
            EXPLORE COLLECTION
        </button>
    );
}