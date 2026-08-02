const AdminTopbar = () => {
  return (
    <header className="h-16 bg-white border-b-2 border-black flex items-center justify-between px-6">
      <div className="flex items-center gap-3">
       

        <h1 className="text-black text-[17px] font-bold tracking-tight">
          Admin Dashboard
        </h1>

        
      </div>

      <div className="flex items-center gap-2 text-neutral-400 text-[11px] font-medium uppercase tracking-widest">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        System Normal
      </div>
    </header>
  );
};

export default AdminTopbar;