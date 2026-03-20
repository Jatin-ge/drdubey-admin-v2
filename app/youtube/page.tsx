import Footer from "@/components/Footer/Footer";
import Navbar from "@/components/Navbar/navbar";
import { YoutubePlayer } from "@/components/ui/video";
import { db } from "@/lib/db";

const Youtube = async() => {
    const youtube  = await db.youTube.findMany({
    })
    return ( 
        <>
        <Navbar />
         <div className="p-4 min-h-screen">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {youtube.map((item) => {
          return <YoutubePlayer key={item.id} url={item.link} />;
        })}
      </div>
    </div>

    <Footer />
    </>
     );
}
 
export default Youtube;