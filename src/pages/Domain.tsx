import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings, Users, Eye, Database, X, Trophy } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "react-router-dom";
import { Home } from "lucide-react";

const Domain = () => {
  const [selectedCapture, setSelectedCapture] = useState<any>(null);
  const [captures, setCaptures] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Gerçek verileri scores.json üzerinden çeken API call
  React.useEffect(() => {
    fetch("/api/scores")
      .then((res) => res.json())
      .then((data) => {
        setCaptures(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Score fetch error:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-sans selection:bg-red-600">
      <title>Domain Expansion - Data Center</title>
      
      {/* Background Arkaplan Efekti */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/40 via-black to-black animate-pulse" />
      </div>

      <header className="relative z-10 mb-12 text-center">
        <div className="absolute left-0 top-0">
          <Link to="/">
            <Button variant="ghost" className="text-zinc-500 hover:text-red-500 hover:bg-red-900/10 gap-2">
              <Home className="w-4 h-4" /> Back to Menu
            </Button>
          </Link>
        </div>
        <motion.h1 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="text-6xl font-black tracking-tighter text-red-600 uppercase italic"
        >
          Archive
        </motion.h1>
        <div className="h-1 w-24 bg-red-600 mx-auto mt-2 blur-[1px]" />
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Ayarlar Paneli (Sol Kolon) */}
        <div className="space-y-6">
          <Card className="bg-zinc-950 border-red-900/50 text-white shadow-2xl shadow-red-900/20">
            <CardHeader className="border-b border-red-900/20">
              <CardTitle className="flex items-center gap-2 text-red-500 font-mono">
                <Settings className="w-5 h-5" /> DETAILED_SETTINGS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-mono">
                  <label>Pinch Sensitivity</label>
                  <span className="text-red-500">0.05</span>
                </div>
                <Slider defaultValue={[5]} max={10} step={1} className="[&_[role=slider]]:bg-red-600" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between text-sm font-mono">
                  <label>Motion Smoothing</label>
                  <span className="text-red-500">15ms</span>
                </div>
                <Slider defaultValue={[15]} max={50} step={1} className="[&_[role=slider]]:bg-red-600" />
              </div>
              <Button className="w-full bg-red-700 hover:bg-red-600 text-white font-bold uppercase tracking-widest border-none h-12">
                Save Protocol
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Liste Paneli (Sağ İki Kolon) */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-zinc-950 border-zinc-800 text-white shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between border-b border-zinc-800">
              <div>
                <CardTitle className="text-2xl font-bold flex items-center gap-2">
                  <Users className="text-red-500" /> Captured Subjects
                </CardTitle>
                <CardDescription className="text-zinc-500 font-mono text-xs">Biometric logs and scores</CardDescription>
              </div>
              <Trophy className="w-8 h-8 text-yellow-600 opacity-50" />
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-zinc-900/50">
                  <TableRow className="border-zinc-800 hover:bg-transparent">
                    <TableHead className="text-zinc-400 font-mono">NAME SURNAME</TableHead>
                    <TableHead className="text-zinc-400 font-mono">SCORE</TableHead>
                    <TableHead className="text-right text-zinc-400 font-mono">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {captures.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-zinc-600 font-mono italic">
                        No biometric logs found in archive.
                      </TableCell>
                    </TableRow>
                  ) : (
                    captures.map((item, index) => (
                      <TableRow key={index} className="border-zinc-800 hover:bg-zinc-900/30 transition-colors group">
                        <TableCell className="font-bold">{item.name} {item.surname}</TableCell>
                        <TableCell className="text-red-500 font-mono font-bold">
                          {item.prize ? item.prize.toLocaleString() : "0"}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="border-zinc-700 hover:bg-red-900/20 hover:text-red-500 hover:border-red-500 transition-all"
                            onClick={() => setSelectedCapture(item)}
                          >
                            <Eye className="w-4 h-4 mr-2" /> View Capture
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal / Overlay (Fotoğraf ve Veri Görüntüleme) */}
      <AnimatePresence>
        {selectedCapture && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
              onClick={() => setSelectedCapture(null)}
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-zinc-950 border border-red-600/50 w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(220,38,38,0.3)]"
            >
              <div className="p-6 border-b border-zinc-800 flex justify-between items-center bg-red-950/10">
                <h3 className="text-xl font-bold font-mono uppercase tracking-tighter">
                  Biometric Data: {selectedCapture.name}
                </h3>
                <Button variant="ghost" size="icon" onClick={() => setSelectedCapture(null)}>
                  <X className="w-6 h-6" />
                </Button>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Fotoğraf */}
                <div className="space-y-4">
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Visual Capture</p>
                  <div className="aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 relative group">
                    <img 
                      src={selectedCapture.photo || "/placeholder.svg"} 
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                      alt="Capture" 
                      onError={(e) => (e.currentTarget.src = "https://api.dicebear.com/7.x/avataaars/svg?seed=" + selectedCapture.name)}
                    />
                    <div className="absolute inset-0 border-[20px] border-black/20 pointer-events-none" />
                  </div>
                </div>
                {/* Sayısal Veriler */}
                <div className="space-y-4">
                  <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Face Descriptor Values</p>
                  <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 font-mono space-y-4 h-[250px] overflow-y-auto scrollbar-thin scrollbar-thumb-red-900">
                    <div className="text-[11px] text-red-500 break-all leading-relaxed">
                      {selectedCapture.faceDescriptor || "No numerical data available."}
                    </div>
                  </div>
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-900 text-[10px] text-zinc-500 font-mono">
                    LOG_DATE: {selectedCapture.date || "N/A"} <br/>
                    CLASS: {selectedCapture.class || "N/A"}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <footer className="mt-24 border-t border-zinc-900 pt-8 text-center text-zinc-700 font-mono text-[10px] uppercase tracking-[0.3em]">
        Archive Module | Project Millionaire-Sarac | Secure Protocol
      </footer>
    </div>
  );
};

export default Domain;
