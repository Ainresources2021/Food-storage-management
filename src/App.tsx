/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  TrendingUp, 
  ShieldCheck, 
  AlertTriangle, 
  Coins, 
  ChevronRight, 
  RotateCcw, 
  Trophy,
  Info,
  CheckCircle2,
  XCircle,
  Volume2,
  VolumeX
} from 'lucide-react';

interface Choice {
  text: string;
  effect: {
    modal: number;
    rep: number;
  };
  isCorrect: boolean;
  explanation: string;
}

interface Question {
  scenario: string;
  choices: Choice[];
  visualType?: 'chiller' | 'fifo' | 'cross_contamination' | 'chemical' | 'pallet' | 'fefo' | 'thawing' | 'ice_scoop' | 'hot_holding' | 'eggs' | 'trash' | 'condensed_milk';
}

const questionsData: Question[] = [
  {
    "scenario": "Susu segar dan dadih baru tiba dari pembekal. Di manakah anda perlu menyimpannya?",
    "visualType": "chiller",
    "choices": [
      { "text": "Peti Sejuk Dingin (Chiller) pada suhu 0°C hingga 4°C", "effect": { "modal": 50, "rep": 5 }, "isCorrect": true, "explanation": "Betul! Suhu chiller 0°C - 4°C melambatkan pertumbuhan bakteria tanpa membekukan produk tenusu." },
      { "text": "Peti Sejuk Beku (Freezer) pada suhu -18°C", "effect": { "modal": -50, "rep": -5 }, "isCorrect": false, "explanation": "Salah! Produk tenusu cecair akan rosak teksturnya jika dibekukan." }
    ]
  },
  {
    "scenario": "Pekerja menjumpai sosej yang telah melepasi tarikh 'Guna Sebelum' (Use By) tetapi bungkusan masih nampak elok.",
    "choices": [
      { "text": "Masak segera dan jual di gerai untuk elak kerugian.", "effect": { "modal": -100, "rep": -20 }, "isCorrect": false, "explanation": "Bahaya! Tarikh 'Guna Sebelum' adalah penunjuk keselamatan. Makanan ini boleh menyebabkan keracunan walaupun nampak elok." },
      { "text": "Buang terus mengikut prosedur pelupusan.", "effect": { "modal": -20, "rep": 10 }, "isCorrect": true, "explanation": "Tindakan tepat. Keselamatan pelanggan lebih penting dari sedikit kerugian kos." }
    ]
  },
  {
    "scenario": "Anda menyusun stok beras di stor. Stok baru tiba hari ini, manakala ada stok lama baki bulan lepas.",
    "visualType": "fifo",
    "choices": [
      { "text": "Letak stok baru di depan supaya mudah diambil.", "effect": { "modal": -50, "rep": -5 }, "isCorrect": false, "explanation": "Salah. Ini mengabaikan sistem FIFO. Stok lama di belakang akan luput dan rugi." },
      { "text": "Alih stok lama ke hadapan, letak stok baru di belakang (Sistem FIFO).", "effect": { "modal": 50, "rep": 5 }, "isCorrect": true, "explanation": "Terbaik! First In, First Out (FIFO) memastikan stok lama digunakan dahulu." }
    ]
  },
  {
    "scenario": "Ayam mentah dan kek keju sedia dimakan (RTE) perlu disimpan di dalam chiller yang sama.",
    "visualType": "cross_contamination",
    "choices": [
      { "text": "Ayam mentah di rak paling bawah, kek keju di rak atas.", "effect": { "modal": 50, "rep": 10 }, "isCorrect": true, "explanation": "Tepat! Ini mengelakkan darah ayam menitik dan mencemarkan makanan sedia dimakan." },
      { "text": "Kek keju di rak bawah, ayam mentah di rak atas supaya ayam cepat sejuk.", "effect": { "modal": -100, "rep": -30 }, "isCorrect": false, "explanation": "Pencemaran silang berlaku! Pelanggan anda mungkin keracunan." }
    ]
  },
  {
    "scenario": "Kerepek pisang di rak pameran telah melepasi tarikh 'Baik Sebelum' (Best Before) dua hari lepas.",
    "choices": [
      { "text": "Periksa kualiti (bau, tekstur). Jika masih elok, jual dengan tanda harga diskaun.", "effect": { "modal": 30, "rep": 0 }, "isCorrect": true, "explanation": "Betul. 'Baik Sebelum' adalah indikator kualiti, bukan keselamatan. Ia masih selamat dimakan jika disimpan dengan baik." },
      { "text": "Buang terus semuanya ke dalam tong sampah.", "effect": { "modal": -50, "rep": 0 }, "isCorrect": false, "explanation": "Kurang tepat. Anda membazirkan produk yang mungkin masih selamat. 'Best Before' bukan 'Use By'." }
    ]
  },
  {
    "scenario": "Anda perlu mencairkan (thaw) daging lembu beku sebanyak 5kg untuk dimasak esok pagi.",
    "visualType": "thawing",
    "choices": [
      { "text": "Letak di atas singki dapur semalaman pada suhu bilik.", "effect": { "modal": -80, "rep": -15 }, "isCorrect": false, "explanation": "Bahaya! Suhu bilik berada dalam 'Zon Bahaya' (Danger Zone). Bakteria membiak pantas pada permukaan daging." },
      { "text": "Pindahkan dari freezer ke dalam chiller semalaman.", "effect": { "modal": 50, "rep": 5 }, "isCorrect": true, "explanation": "Sangat selamat. Pencairan di dalam chiller memastikan daging sentiasa di bawah 4°C." }
    ]
  },
  {
    "scenario": "Penghantaran roti tiba. Roti Jenama A luput 20hb, manakala Roti Jenama B luput 18hb. Roti A tiba lebih awal di stor.",
    "visualType": "fefo",
    "choices": [
      { "text": "Guna sistem FEFO: Jual Roti B (luput 18hb) dahulu walaupun Roti A tiba awal.", "effect": { "modal": 50, "rep": 5 }, "isCorrect": true, "explanation": "Bijak! First Expired, First Out (FEFO) mengutamakan tarikh luput berbanding tarikh terima (FIFO)." },
      { "text": "Guna sistem FIFO: Jual Roti A dahulu sebab ia masuk stor dulu.", "effect": { "modal": -40, "rep": -5 }, "isCorrect": false, "explanation": "Salah. Roti B akan luput di atas rak jika anda tunggu Roti A habis terjual." }
    ]
  },
  {
    "scenario": "Peti chiller kedai didapati terlalu padat dengan stok sehingga tiada ruang udara.",
    "choices": [
      { "text": "Biar sahaja asalkan pintu boleh ditutup rapat.", "effect": { "modal": -60, "rep": -10 }, "isCorrect": false, "explanation": "Salah. Udara sejuk perlu beredar untuk mengekalkan suhu 4°C. Chiller padat akan menjadi panas." },
      { "text": "Kurangkan stok, susun semula supaya ada ruang untuk pengedaran udara sejuk.", "effect": { "modal": 30, "rep": 10 }, "isCorrect": true, "explanation": "Betul! Chiller yang tidak padat berfungsi dengan cekap dan memanjangkan hayat makanan." }
    ]
  },
  {
    "scenario": "Pekerja gerai jualan mencedok ais untuk dimasukkan ke dalam air balang pelanggan.",
    "visualType": "ice_scoop",
    "choices": [
      { "text": "Gunakan skop ais khas yang bersih dan simpan skop di luar balang ais.", "effect": { "modal": 20, "rep": 15 }, "isCorrect": true, "explanation": "Prosedur kebersihan yang sangat baik. Menghalang kuman dari tangan masuk ke dalam ais." },
      { "text": "Gunakan cawan plastik pelanggan untuk mencedok ais dari tong.", "effect": { "modal": -30, "rep": -20 }, "isCorrect": false, "explanation": "Kotor! Tangan pekerja dan kuman pada luar cawan akan mencemarkan seluruh tong ais." }
    ]
  },
  {
    "scenario": "Sup daging telah siap dimasak panas-panas tetapi pelanggan belum ramai.",
    "visualType": "hot_holding",
    "choices": [
      { "text": "Padamkan api dapur sepenuhnya untuk jimat gas, biar sup di atas dapur.", "effect": { "modal": 20, "rep": -30 }, "isCorrect": false, "explanation": "Bahaya! Sup akan masuk ke 'Zon Bahaya' (5°C - 60°C). Spora bakteria boleh aktif semula." },
      { "text": "Kekalkan atas api kecil (hot holding) pastikan suhu sentiasa melebihi 60°C.", "effect": { "modal": -10, "rep": 20 }, "isCorrect": true, "explanation": "Tepat! Mengekalkan suhu makanan panas melebihi 60°C membantutkan pembiakan bakteria." }
    ]
  },
  {
    "scenario": "Anda menemui peket sosej di dalam freezer yang dipenuhi ais tebal dan kering (freezer burn).",
    "choices": [
      { "text": "Sosej rosak dan beracun, mesti dibuang.", "effect": { "modal": -30, "rep": 0 }, "isCorrect": false, "explanation": "Kurang tepat. Freezer burn menjejaskan kualiti dan rasa (kering), tetapi bukan isu keselamatan makanan." },
      { "text": "Potong bahagian yang kering, bahagian lain masih selamat dimasak.", "effect": { "modal": 20, "rep": 0 }, "isCorrect": true, "explanation": "Betul. Ia selamat, cuma kualitinya menurun akibat pendedahan kepada udara sejuk beku." }
    ]
  },
  {
    "scenario": "Stok beras guni 10kg perlu disusun di dalam stor kering.",
    "visualType": "pallet",
    "choices": [
      { "text": "Susun terus di atas lantai berjubin sebab lantai sejuk.", "effect": { "modal": -40, "rep": -10 }, "isCorrect": false, "explanation": "Salah. Makanan tidak boleh diletakkan terus di atas lantai untuk elak kelembapan dan perosak." },
      { "text": "Susun di atas palet kayu/plastik sekurang-kurangnya 15cm dari lantai.", "effect": { "modal": 40, "rep": 10 }, "isCorrect": true, "explanation": "Syarat penyimpanan stor yang patuh! Mudah dibersihkan dan elak serangan tikus." }
    ]
  },
  {
    "scenario": "Kari lebihan hari ini sangat banyak. Anda mahu simpan di dalam chiller untuk dijual esok.",
    "choices": [
      { "text": "Masukkan periuk besar yang masih panas berasap terus ke dalam chiller.", "effect": { "modal": -50, "rep": -15 }, "isCorrect": false, "explanation": "Salah! Makanan panas akan menaikkan suhu chiller dan merosakkan makanan lain di dalamnya." },
      { "text": "Sejukkan pada suhu bilik (maksimum 2 jam), pindah ke bekas kecil, baru masuk chiller.", "effect": { "modal": 30, "rep": 10 }, "isCorrect": true, "explanation": "Kaedah penyejukan yang tepat. Bekas kecil mempercepatkan proses makanan sejuk di chiller." }
    ]
  },
  {
    "scenario": "Telur segar dibeli dari ladang kelihatan sedikit kotor.",
    "visualType": "eggs",
    "choices": [
      { "text": "Basuh semua telur dengan air paip sebelum simpan dalam peti sejuk.", "effect": { "modal": -20, "rep": -10 }, "isCorrect": false, "explanation": "Membasuh telur akan membuang lapisan perlindungan semula jadinya (cuticle), membenarkan bakteria masuk." },
      { "text": "Lap dengan kain kering, simpan di dalam bekas bertutup di chiller.", "effect": { "modal": 20, "rep": 10 }, "isCorrect": true, "explanation": "Tepat! Basuh telur hanya sejurus sebelum digunakan." }
    ]
  },
  {
    "scenario": "Daging telah dicairkan (thawed) di dalam chiller, tetapi tempahan dibatalkan. Boleh bekukan semula?",
    "choices": [
      { "text": "Boleh bekukan semula mentah-mentah asalkan belum rosak.", "effect": { "modal": -50, "rep": -20 }, "isCorrect": false, "explanation": "Bahaya! Membekukan semula daging mentah merosakkan sel daging dan bakteria mungkin telah membiak." },
      { "text": "Masak daging tersebut sehingga masak sepenuhnya, kemudian simpan lauk matang di freezer.", "effect": { "modal": 40, "rep": 10 }, "isCorrect": true, "explanation": "Betul. Proses memasak membunuh bakteria, membolehkan lauk itu dibekukan dengan selamat." }
    ]
  },
  {
    "scenario": "Terdapat lalat mula berkerumun di kawasan tong sampah dapur berhampiran sinki.",
    "visualType": "trash",
    "choices": [
      { "text": "Tukar tong sampah kepada jenis berpolos/terbuka supaya bau cepat hilang.", "effect": { "modal": -30, "rep": -30 }, "isCorrect": false, "explanation": "Salah! Tong sampah terbuka menarik perhatian perosak dan menyebarkan penyakit." },
      { "text": "Guna tong bertutup, buang sampah berjadual, dan sembur sanitasi di sekeliling tong.", "effect": { "modal": 20, "rep": 15 }, "isCorrect": true, "explanation": "Tindakan pengurusan sampah yang sangat cemerlang." }
    ]
  },
  {
    "scenario": "Label pada tin pes tomato telah terkoyak dan tarikh luput tidak dapat dibaca.",
    "choices": [
      { "text": "Buka sedikit, jika bau dan warnanya elok, gunakan segera.", "effect": { "modal": -40, "rep": -20 }, "isCorrect": false, "explanation": "Risiko tinggi. Bakteria dalam makanan tin (C. botulinum) tidak selalu berbau busuk tetapi mematikan." },
      { "text": "Asingkan, tandakan 'JANGAN GUNA' dan lupuskan/pulangkan jika ragu-ragu.", "effect": { "modal": -10, "rep": 15 }, "isCorrect": true, "explanation": "Peraturan emas dapur: Apabila ragu-ragu, buang sahaja (When in doubt, throw it out)." }
    ]
  },
  {
    "scenario": "Suhu bahaya (Danger Zone) di mana bakteria membiak paling pantas adalah antara:",
    "choices": [
      { "text": "5°C hingga 60°C", "effect": { "modal": 30, "rep": 10 }, "isCorrect": true, "explanation": "Tepat! Pastikan makanan sejuk di bawah 5°C, dan makanan panas di atas 60°C." },
      { "text": "-18°C hingga 4°C", "effect": { "modal": -20, "rep": -10 }, "isCorrect": false, "explanation": "Salah. Itu adalah suhu selamat untuk penyimpanan chiller and freezer." }
    ]
  },
  {
    "scenario": "Bahan kimia pencuci lantai diletakkan sebentar di atas meja persediaan makanan.",
    "visualType": "chemical",
    "choices": [
      { "text": "Pindahkan segera ke kabinet khas bahan kimia berjauhan dari makanan.", "effect": { "modal": 10, "rep": 20 }, "isCorrect": true, "explanation": "Sangat cepat dan tepat. Ini menghalang pencemaran kimia yang boleh meracuni makanan." },
      { "text": "Biar sementara waktu asalkan penutupnya diikat ketat.", "effect": { "modal": -50, "rep": -25 }, "isCorrect": false, "explanation": "Haram di dapur! Sebarang tumpahan akan menyebabkan malapetaka." }
    ]
  },
  {
    "scenario": "Susu pekat manis digunakan untuk membancuh teh tarik. Tin telah dibuka.",
    "visualType": "condensed_milk",
    "choices": [
      { "text": "Biarkan tin terbuka di suhu bilik, susu pekat ada gula tinggi tak mudah rosak.", "effect": { "modal": -30, "rep": -10 }, "isCorrect": false, "explanation": "Salah. Walaupun tahan lama, tin terbuka terdedah kepada serangga dan habuk." },
      { "text": "Pindah baki susu ke dalam bekas plastik bertutup dan simpan dalam chiller.", "effect": { "modal": 20, "rep": 10 }, "isCorrect": true, "explanation": "Amalan terbaik. Mengelakkan karat dari tin dan menjaga kualiti produk." }
    ]
  }
];

type Difficulty = 'easy' | 'medium' | 'hard';

interface DifficultySettings {
  label: string;
  startModal: number;
  multiplier: number;
  color: string;
}

const DIFFICULTY_CONFIG: Record<Difficulty, DifficultySettings> = {
  easy: { label: 'Mudah', startModal: 1500, multiplier: 0.5, color: 'text-emerald-600' },
  medium: { label: 'Sederhana', startModal: 1000, multiplier: 1.0, color: 'text-amber-600' },
  hard: { label: 'Sukar', startModal: 500, multiplier: 1.5, color: 'text-red-600' }
};

const WarehouseVisual = ({ type }: { type: Question['visualType'] }) => {
  if (!type) return null;

  const renderContent = () => {
    switch (type) {
      case 'chiller':
        return (
          <div className="relative w-full h-40 bg-slate-100 rounded-xl border-4 border-slate-300 flex flex-col p-2 gap-2">
            <div className="h-1/3 border-b-2 border-slate-200 flex items-center justify-around">
              <div className="w-8 h-8 bg-blue-200 rounded-md animate-pulse" title="Susu" />
              <div className="w-8 h-8 bg-blue-200 rounded-md animate-pulse" title="Dadih" />
            </div>
            <div className="h-1/3 border-b-2 border-slate-200 flex items-center justify-around">
              <div className="w-10 h-6 bg-slate-300 rounded" />
            </div>
            <div className="h-1/3 flex items-center justify-around">
              <div className="w-10 h-6 bg-slate-300 rounded" />
            </div>
            <div className="absolute -right-2 top-10 w-1 h-12 bg-slate-400 rounded-full" />
          </div>
        );
      case 'fifo':
        return (
          <div className="w-full h-40 bg-amber-50 rounded-xl border-2 border-amber-200 p-4 flex flex-col justify-center">
            <div className="flex justify-between items-end gap-4">
              <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-20 bg-amber-200 rounded-t-lg border-2 border-amber-400 flex items-center justify-center text-[10px] font-bold text-amber-700">LAMA</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Hadapan</div>
              </div>
              <div className="flex flex-col items-center gap-2 opacity-60">
                <div className="w-16 h-20 bg-amber-100 rounded-t-lg border-2 border-amber-300 flex items-center justify-center text-[10px] font-bold text-amber-600">BARU</div>
                <div className="text-[10px] font-bold text-slate-400 uppercase">Belakang</div>
              </div>
              <ChevronRight className="w-8 h-8 text-amber-400 self-center animate-bounce-x" />
            </div>
          </div>
        );
      case 'cross_contamination':
        return (
          <div className="w-full h-48 bg-slate-50 rounded-xl border-2 border-slate-200 flex flex-col">
            <div className="flex-1 border-b-2 border-slate-100 p-2 flex items-center justify-center gap-4">
              <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-bold border border-emerald-200">KEK KEJU (RTE)</div>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex-1 border-b-2 border-slate-100 p-2 flex items-center justify-center italic text-slate-300 text-[10px]">Ruang Kosong</div>
            <div className="flex-1 p-2 flex items-center justify-center gap-4">
              <div className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold border border-red-200">AYAM MENTAH</div>
              <AlertTriangle className="w-4 h-4 text-red-500" />
            </div>
          </div>
        );
      case 'fefo':
        return (
          <div className="w-full h-40 flex items-center justify-center gap-6">
            <div className="relative group">
              <div className="w-20 h-24 bg-orange-100 border-2 border-orange-300 rounded-lg flex flex-col items-center justify-center p-2 shadow-sm">
                <div className="text-[10px] font-black text-orange-800">ROTI B</div>
                <div className="mt-2 text-[8px] bg-red-500 text-white px-1 rounded">18 HB</div>
              </div>
              <div className="absolute -top-2 -right-2 bg-red-600 text-white text-[8px] font-bold px-1 rounded-full animate-pulse">JUAL DULU</div>
            </div>
            <div className="w-20 h-24 bg-orange-50 border-2 border-orange-200 rounded-lg flex flex-col items-center justify-center p-2 opacity-70">
              <div className="text-[10px] font-black text-orange-700">ROTI A</div>
              <div className="mt-2 text-[8px] bg-slate-400 text-white px-1 rounded">20 HB</div>
            </div>
          </div>
        );
      case 'pallet':
        return (
          <div className="w-full h-40 bg-slate-50 rounded-xl border-2 border-slate-200 relative overflow-hidden flex flex-col items-center justify-end pb-4">
            <div className="w-48 h-4 bg-amber-800 rounded shadow-md z-10" title="Palet" />
            <div className="flex gap-1 z-20 -mb-1">
              <div className="w-12 h-16 bg-amber-100 border border-amber-300 rounded-sm" />
              <div className="w-12 h-16 bg-amber-100 border border-amber-300 rounded-sm" />
              <div className="w-12 h-16 bg-amber-100 border border-amber-300 rounded-sm" />
            </div>
            <div className="absolute bottom-0 w-full h-4 bg-slate-200" />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] font-bold text-slate-400">JARAK 15CM DARI LANTAI</div>
          </div>
        );
      case 'chemical':
        return (
          <div className="w-full h-40 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center gap-12 relative">
            <div className="flex flex-col items-center gap-2">
              <div className="w-16 h-12 bg-indigo-100 rounded-t-xl border-2 border-indigo-200 flex items-center justify-center">
                <div className="w-8 h-4 bg-indigo-300 rounded-full" />
              </div>
              <div className="text-[10px] font-bold text-indigo-600 uppercase">MAKANAN</div>
            </div>
            <div className="h-20 w-px bg-slate-200" />
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-16 bg-red-50 border-2 border-red-200 rounded-md flex flex-col items-center p-1">
                <div className="w-4 h-2 bg-red-400 rounded-full mb-2" />
                <AlertTriangle className="w-4 h-4 text-red-500" />
              </div>
              <div className="text-[10px] font-bold text-red-600 uppercase">KIMIA</div>
            </div>
            <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-red-100 text-red-600 text-[8px] font-black px-2 py-1 rounded-full border border-red-200">ASINGKAN!</div>
          </div>
        );
      case 'thawing':
        return (
          <div className="w-full h-40 bg-blue-50 rounded-xl border-2 border-blue-200 flex items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 bg-blue-200 rounded-lg border-2 border-blue-400 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-white/30 animate-pulse" />
                <div className="w-12 h-12 bg-red-300 rounded-md rotate-12 shadow-sm" />
              </div>
              <div className="text-[10px] font-bold text-blue-700 uppercase">FREEZER (-18°C)</div>
            </div>
            <ChevronRight className="w-6 h-6 text-blue-400 animate-bounce-x" />
            <div className="flex flex-col items-center gap-2">
              <div className="w-20 h-20 bg-slate-100 rounded-lg border-2 border-slate-300 flex items-center justify-center">
                <div className="w-12 h-12 bg-red-200 rounded-md shadow-sm" />
              </div>
              <div className="text-[10px] font-bold text-slate-600 uppercase">CHILLER (4°C)</div>
            </div>
          </div>
        );
      case 'ice_scoop':
        return (
          <div className="w-full h-40 bg-cyan-50 rounded-xl border-2 border-cyan-200 flex items-center justify-center gap-8">
            <div className="w-24 h-28 bg-white border-4 border-cyan-300 rounded-t-2xl relative overflow-hidden">
              <div className="absolute bottom-0 w-full h-3/4 bg-cyan-100 flex flex-wrap p-1 gap-1">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="w-4 h-4 bg-white rounded-sm shadow-sm" />
                ))}
              </div>
            </div>
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 border-2 border-slate-300 rounded-xl flex items-center justify-center rotate-45">
                <div className="w-8 h-4 bg-slate-400 rounded-full -rotate-45" />
              </div>
              <div className="text-[10px] font-bold text-slate-500 uppercase">SKOP KHAS</div>
            </div>
          </div>
        );
      case 'hot_holding':
        return (
          <div className="w-full h-40 bg-orange-50 rounded-xl border-2 border-orange-200 flex items-center justify-center gap-8">
            <div className="relative">
              <div className="w-24 h-20 bg-slate-400 rounded-b-xl border-t-8 border-slate-600 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-4 h-8 bg-slate-300/50 rounded-full blur-sm animate-bounce" />
                <div className="absolute inset-x-2 bottom-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              </div>
              <div className="absolute -right-12 top-1/2 -translate-y-1/2 flex flex-col items-center">
                <div className="text-xl font-black text-orange-600">60°C+</div>
                <div className="text-[8px] font-bold text-orange-400 uppercase">SUHU SELAMAT</div>
              </div>
            </div>
          </div>
        );
      case 'eggs':
        return (
          <div className="w-full h-40 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center gap-4">
            <div className="w-32 h-24 bg-amber-50 border-2 border-amber-200 rounded-lg p-2 grid grid-cols-3 gap-1">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="w-full aspect-square bg-white border border-amber-100 rounded-full shadow-sm flex items-center justify-center">
                  <div className="w-1 h-1 bg-amber-900/20 rounded-full" />
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-2">
              <div className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-[10px] font-bold">LAP KERING</div>
              <div className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-bold opacity-40">JANGAN BASUH</div>
            </div>
          </div>
        );
      case 'trash':
        return (
          <div className="w-full h-40 bg-slate-50 rounded-xl border-2 border-slate-200 flex items-center justify-center gap-12 relative overflow-hidden">
            <div className="relative">
              <div className="w-16 h-24 bg-slate-300 border-x-4 border-slate-400 rounded-b-lg relative">
                <div className="absolute -top-2 -left-1 w-18 h-4 bg-slate-500 rounded-full shadow-md" />
              </div>
              <div className="absolute -top-8 left-0 flex gap-2">
                <div className="w-1 h-1 bg-black rounded-full animate-ping" />
                <div className="w-1 h-1 bg-black rounded-full animate-ping delay-100" />
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-black text-red-600 uppercase">KAWALAN PEROSAK</div>
              <div className="text-[8px] font-bold text-slate-400 uppercase">TUTUP RAPAT & BUANG KERAP</div>
            </div>
          </div>
        );
      case 'condensed_milk':
        return (
          <div className="w-full h-40 bg-white rounded-xl border-2 border-slate-200 flex items-center justify-center gap-8">
            <div className="w-16 h-20 bg-slate-200 border-2 border-slate-300 rounded-md relative">
              <div className="absolute -top-1 inset-x-0 h-2 bg-slate-400 rounded-full" />
              <div className="absolute inset-2 bg-white/50 rounded flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <ChevronRight className="w-6 h-6 text-slate-300" />
            <div className="w-16 h-20 bg-blue-50 border-2 border-blue-200 rounded-xl flex items-center justify-center">
              <div className="w-10 h-10 bg-white border border-blue-100 rounded-full shadow-sm" />
            </div>
            <div className="text-[10px] font-bold text-blue-600 uppercase">PINDAH KE BEKAS BARU</div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mb-8"
    >
      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
        <TrendingUp className="w-3 h-3" /> Visualisasi Ruang
      </div>
      {renderContent()}
    </motion.div>
  );
};

export default function App() {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'gameover' | 'victory'>('start');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [currentIdx, setCurrentIdx] = useState(0);
  const [modal, setModal] = useState(1000);
  const [reputasi, setReputasi] = useState(100);
  const [showFeedback, setShowFeedback] = useState(false);
  const [lastFeedback, setLastFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const sounds = useRef({
    correct: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'),
    incorrect: new Audio('https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3'),
    victory: new Audio('https://assets.mixkit.co/active_storage/sfx/1435/1435-preview.mp3'),
    gameover: new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3')
  });

  const playSound = (type: keyof typeof sounds.current) => {
    if (!isMuted) {
      const audio = sounds.current[type];
      audio.currentTime = 0;
      audio.play().catch(e => console.log("Audio play blocked", e));
    }
  };

  useEffect(() => {
    if (modal <= 0 || reputasi <= 0) {
      setGameState('gameover');
      playSound('gameover');
    }
  }, [modal, reputasi]);

  const startGame = () => {
    const config = DIFFICULTY_CONFIG[difficulty];
    setModal(config.startModal);
    setReputasi(100);
    setCurrentIdx(0);
    
    // Reorder questions based on difficulty: 
    // Hard mode puts high-risk questions (large negative effects) earlier
    const sortedQuestions = [...questionsData].sort((a, b) => {
      if (difficulty === 'hard') {
        const minA = Math.min(...a.choices.map(c => c.effect.modal));
        const minB = Math.min(...b.choices.map(c => c.effect.modal));
        return minA - minB; // Most negative first
      }
      if (difficulty === 'easy') {
        const minA = Math.min(...a.choices.map(c => c.effect.modal));
        const minB = Math.min(...b.choices.map(c => c.effect.modal));
        return minB - minA; // Least negative first
      }
      return Math.random() - 0.5; // Random for medium
    });

    setQuestions(sortedQuestions);
    setGameState('playing');
    setShowFeedback(false);
  };

  const handleChoice = (choice: Choice) => {
    const config = DIFFICULTY_CONFIG[difficulty];
    const modalEffect = choice.effect.modal < 0 ? choice.effect.modal * config.multiplier : choice.effect.modal;
    const repEffect = choice.effect.rep < 0 ? choice.effect.rep * config.multiplier : choice.effect.rep;

    setModal(prev => Math.max(0, prev + Math.round(modalEffect)));
    setReputasi(prev => Math.min(100, Math.max(0, prev + Math.round(repEffect))));
    setLastFeedback({ isCorrect: choice.isCorrect, text: choice.explanation });
    setShowFeedback(true);
    playSound(choice.isCorrect ? 'correct' : 'incorrect');
  };

  const nextQuestion = () => {
    setShowFeedback(false);
    if (currentIdx + 1 >= questions.length) {
      setGameState('victory');
      playSound('victory');
    } else {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const renderStart = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto text-center p-8 bg-white rounded-3xl shadow-xl border border-slate-100"
    >
      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <ShieldCheck className="w-12 h-12 text-emerald-600" />
      </div>
      <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Hartawan Simpanan Makanan</h1>
      <p className="text-slate-600 mb-8 text-lg">
        Uruskan gudang bekalan makanan anda dengan bijak. Patuhi prinsip keselamatan makanan untuk kekal untung dan bereputasi tinggi!
      </p>
      <div className="grid grid-cols-2 gap-4 mb-8 text-left">
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">
            <Coins className="w-4 h-4" /> Modal Permulaan
          </div>
          <div className="text-2xl font-bold text-slate-900">RM {DIFFICULTY_CONFIG[difficulty].startModal}</div>
        </div>
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium mb-1 uppercase tracking-wider">
            <TrendingUp className="w-4 h-4" /> Impak Penalti
          </div>
          <div className="text-2xl font-bold text-slate-900">{DIFFICULTY_CONFIG[difficulty].multiplier}x</div>
        </div>
      </div>

      <div className="mb-8">
        <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Pilih Tahap Kesukaran</div>
        <div className="grid grid-cols-3 gap-3">
          {(Object.keys(DIFFICULTY_CONFIG) as Difficulty[]).map((level) => (
            <button
              key={level}
              onClick={() => setDifficulty(level)}
              className={`py-3 px-2 rounded-xl font-bold transition-all border-2 ${
                difficulty === level 
                  ? `bg-slate-900 text-white border-slate-900 shadow-md` 
                  : `bg-white text-slate-600 border-slate-100 hover:border-slate-300`
              }`}
            >
              {DIFFICULTY_CONFIG[level].label}
            </button>
          ))}
        </div>
      </div>
      <button 
        onClick={startGame}
        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xl transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 group"
      >
        Mula Operasi <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
      </button>
    </motion.div>
  );

  const renderPlaying = () => {
    const question = questions[currentIdx];
    if (!question) return null;
    return (
      <div className="max-w-4xl mx-auto">
        {/* Stats Header */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center overflow-hidden">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Modal</span>
            <motion.div 
              key={modal}
              initial={{ scale: 1.2, color: "#10b981" }}
              animate={{ scale: 1, color: modal < 300 ? "#ef4444" : "#0f172a" }}
              className={`text-2xl font-black`}
            >
              RM {modal}
            </motion.div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center overflow-hidden">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Reputasi</span>
            <motion.div 
              key={reputasi}
              initial={{ scale: 1.2, color: "#10b981" }}
              animate={{ scale: 1, color: reputasi < 30 ? "#ef4444" : "#059669" }}
              className={`text-2xl font-black`}
            >
              {reputasi}%
            </motion.div>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center justify-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Soalan</span>
            <div className="text-2xl font-black text-slate-900">
              {currentIdx + 1} / {questions.length}
            </div>
          </div>
        </div>

        {/* Question Card */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={currentIdx}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${DIFFICULTY_CONFIG[difficulty].color} border-current opacity-70`}>
                Tahap: {DIFFICULTY_CONFIG[difficulty].label}
              </span>
            </div>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                <Info className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                {question.scenario}
              </h2>
            </div>

            <WarehouseVisual type={question.visualType} />

            <div className="space-y-4">
              {question.choices.map((choice, i) => (
                <motion.button
                  key={i}
                  disabled={showFeedback}
                  whileHover={!showFeedback ? { scale: 1.01, x: 5 } : {}}
                  whileTap={!showFeedback ? { scale: 0.99 } : {}}
                  onClick={() => handleChoice(choice)}
                  className={`w-full p-5 text-left rounded-2xl border-2 transition-all flex items-center justify-between group
                    ${showFeedback ? 'cursor-default opacity-50' : 'hover:border-indigo-600 hover:bg-indigo-50 border-slate-100 bg-white'}
                  `}
                >
                  <span className="text-lg font-medium text-slate-700">{choice.text}</span>
                  {!showFeedback && <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-indigo-600 transition-colors" />}
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Feedback Modal */}
        <AnimatePresence>
          {showFeedback && lastFeedback && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
            >
              <motion.div 
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1, 
                  y: 0,
                  x: lastFeedback.isCorrect ? 0 : [0, -10, 10, -10, 10, 0] 
                }}
                transition={{ 
                  type: "spring", 
                  damping: 15, 
                  stiffness: 300,
                  x: { duration: 0.4, times: [0, 0.2, 0.4, 0.6, 0.8, 1] }
                }}
                className="bg-white max-w-md w-full rounded-3xl p-8 shadow-2xl border-4 border-transparent"
                style={{ borderColor: lastFeedback.isCorrect ? '#10b981' : '#ef4444' }}
              >
                <div className="text-center mb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
                  >
                    {lastFeedback.isCorrect ? (
                      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <CheckCircle2 className="w-12 h-12 text-emerald-600" />
                      </div>
                    ) : (
                      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                        <XCircle className="w-12 h-12 text-red-600" />
                      </div>
                    )}
                  </motion.div>
                  <motion.h3 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`text-3xl font-black mb-3 ${lastFeedback.isCorrect ? 'text-emerald-600' : 'text-red-600'}`}
                  >
                    {lastFeedback.isCorrect ? 'Tepat Sekali!' : 'Kurang Tepat!'}
                  </motion.h3>
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="text-slate-600 text-lg leading-relaxed font-medium"
                  >
                    {lastFeedback.text}
                  </motion.p>
                </div>
                <motion.button 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={nextQuestion}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xl hover:bg-slate-800 transition-colors shadow-lg"
                >
                  Teruskan
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderGameOver = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto text-center p-10 bg-white rounded-3xl shadow-2xl border border-red-100"
    >
      <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertTriangle className="w-12 h-12 text-red-600" />
      </div>
      <h2 className="text-4xl font-black text-slate-900 mb-4">Permainan Tamat!</h2>
      <p className="text-slate-600 mb-8 text-lg">
        {modal <= 0 ? 'Modal anda telah habis.' : 'Reputasi anda telah hancur.'} Perniagaan anda terpaksa ditutup demi keselamatan awam.
      </p>
      <button 
        onClick={startGame}
        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-6 h-6" /> Cuba Lagi
      </button>
    </motion.div>
  );

  const renderVictory = () => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto text-center p-10 bg-white rounded-3xl shadow-2xl border border-emerald-100"
    >
      <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Trophy className="w-12 h-12 text-emerald-600" />
      </div>
      <h2 className="text-4xl font-black text-slate-900 mb-4">Tahniah!</h2>
      <p className="text-2xl font-bold text-emerald-600 mb-4">Anda Pakar Keselamatan Makanan</p>
      <p className="text-slate-600 mb-8 text-lg">
        Anda telah berjaya menguruskan gudang makanan dengan cemerlang sambil mengekalkan piawaian keselamatan yang tertinggi.
      </p>
      
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="p-6 bg-emerald-50 rounded-3xl">
          <div className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-1">Modal Akhir</div>
          <div className="text-3xl font-black text-slate-900">RM {modal}</div>
        </div>
        <div className="p-6 bg-emerald-50 rounded-3xl">
          <div className="text-sm font-bold text-emerald-600 uppercase tracking-widest mb-1">Reputasi Akhir</div>
          <div className="text-3xl font-black text-slate-900">{reputasi}%</div>
        </div>
      </div>

      <button 
        onClick={startGame}
        className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold text-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
      >
        <RotateCcw className="w-6 h-6" /> Main Semula
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans relative">
      <button 
        onClick={() => setIsMuted(!isMuted)}
        className="fixed top-6 right-6 p-4 bg-white rounded-2xl shadow-lg border border-slate-100 hover:bg-slate-50 transition-colors z-50"
        title={isMuted ? "Buka Suara" : "Senyap"}
      >
        {isMuted ? <VolumeX className="w-6 h-6 text-slate-400" /> : <Volume2 className="w-6 h-6 text-indigo-600" />}
      </button>
      <div className="container mx-auto">
        {gameState === 'start' && renderStart()}
        {gameState === 'playing' && renderPlaying()}
        {gameState === 'gameover' && renderGameOver()}
        {gameState === 'victory' && renderVictory()}
      </div>
      <footer className="mt-12 text-center text-slate-400 text-sm font-medium">
        @Ts. Siti Nurul Ain Saipullizan
      </footer>
    </div>
  );
}
