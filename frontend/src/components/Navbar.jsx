import { Link } from "react-router-dom";
import { MessageSquare } from "lucide-react";

const Navbar = () => {

  return (
    <header
      className={`bg-base-100 border-b border-base-300 fixed w-full z-50 
    backdrop-blur-lg bg-base-100/80 ${
      window.electronAPI ? 'top-8' : 'top-0'
    }`}
    >
      <div className="mx-0.5 px-2 h-14">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">CatChat</h1>
            </Link>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;