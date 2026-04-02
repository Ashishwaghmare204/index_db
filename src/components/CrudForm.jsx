import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DB_NAME = "coding_ott";
const VERSION = 1;

// ─── DB Connection ────────────────────────────────────────────────────────────
const dbConnect = () => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);

    req.onupgradeneeded = () => {
      const db = req.result;
      const payload = { keyPath: "id", autoIncrement: true };
      if (!db.objectStoreNames.contains("users"))
        db.createObjectStore("users", payload);
      if (!db.objectStoreNames.contains("employee"))
        db.createObjectStore("employee", payload);
      if (!db.objectStoreNames.contains("salaries"))
        db.createObjectStore("salaries", payload);
      if (!db.objectStoreNames.contains("payments"))
        db.createObjectStore("payments", payload);
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

// ─── CrudForm ──────────────────────────────────────────────────────────────────────
const CrudForm = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [targetId, setTargetId] = useState("");
  const [updateName, setUpdateName] = useState("");
  const [logs, setLogs] = useState([]);

  const addLog = (msg, type = "info") => {
    setLogs((prev) => [
      { msg, type, time: new Date().toLocaleTimeString() },
      ...prev.slice(0, 19),
    ]);
  };

  // ── Store ──────────────────────────────────────────────────────────────────
  const storeData = async () => {
    if (!name.trim() || !email.trim()) {
      toast.warn("Fill both Name and Email !");
      return;
    }
    try {
      const db = await dbConnect();
      const transaction = db.transaction("users", "readwrite");
      const store = transaction.objectStore("users");
      store.add({ name: name.trim(), email: email.trim() });

      transaction.oncomplete = () => {
        toast.success("Data stored Successfully ✅");
        addLog(`Added → name: ${name}, email: ${email}`, "success");
        setName("");
        setEmail("");
      };
      transaction.onerror = () => {
        toast.error("Store fail ❌");
        addLog("Store failed", "error");
      };
    } catch (err) {
      toast.error(err.message);
      addLog(err.message, "error");
    }
  };

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchData = async () => {
    try {
      const db = await dbConnect();
      const transaction = db.transaction("users", "readonly");
      const req = transaction.objectStore("users").getAll();

      req.onsuccess = () => {
        const results = req.result;
        if (results.length === 0) {
          toast.info("Didn't got any data");
          addLog("Fetch → 0 records", "info");
        } else {
          toast.success(`${results.length} record(s) got 🎉`);
          results.forEach((r) =>
            addLog(`ID:${r.id} → ${r.name} | ${r.email}`, "success")
          );
        }
        console.table(results);
      };
      req.onerror = () => {
        toast.error("Fetch fail ❌");
        addLog("Fetch failed", "error");
      };
    } catch (err) {
      toast.error(err.message);
      addLog(err.message, "error");
    }
  };

  // ── Update ─────────────────────────────────────────────────────────────────
  const updateData = async () => {
    const id = parseInt(targetId);
    if (!id || !updateName.trim()) {
      toast.warn("Required both new name and ID");
      return;
    }
    try {
      const db = await dbConnect();
      const transaction = db.transaction("users", "readwrite");
      const store = transaction.objectStore("users");
      const req = store.get(id);

      req.onsuccess = () => {
        const data = req.result;
        if (!data) {
          toast.error(`ID ${id} not found ❌`);
          addLog(`Update → ID ${id} not found`, "error");
          return;
        }
        store.put({ ...data, name: updateName.trim() });
      };

      transaction.oncomplete = () => {
        toast.success("Data updated ✅");
        addLog(`Updated ID:${id} → name: ${updateName}`, "success");
        setTargetId("");
        setUpdateName("");
      };
      transaction.onerror = () => {
        toast.error("Update fail ❌");
        addLog("Update failed", "error");
      };
    } catch (err) {
      toast.error(err.message);
      addLog(err.message, "error");
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteData = async () => {
    const id = parseInt(targetId);
    if (!id) {
      toast.warn("enter id to delete!");
      return;
    }
    try {
      const db = await dbConnect();
      const transaction = db.transaction("users", "readwrite");
      const store = transaction.objectStore("users");

      // First verify it exists
      const getReq = store.get(id);
      getReq.onsuccess = () => {
        if (!getReq.result) {
          toast.error(`ID ${id} doesn't exist ❌`);
          addLog(`Delete → ID ${id} not found`, "error");
          return;
        }
        store.delete(id);
      };

      transaction.oncomplete = () => {
        toast.success(`ID ${id} deleted 🗑️`);
        addLog(`Deleted ID:${id}`, "error");
        setTargetId("");
      };
      transaction.onerror = () => {
        toast.error("Delete fail ❌");
        addLog("Delete failed", "error");
      };
    } catch (err) {
      toast.error(err.message);
      addLog(err.message, "error");
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-950 text-white p-8 font-mono">
      <h1 className="text-2xl font-bold mb-8 text-indigo-400 tracking-widest uppercase">
        IndexedDB · Users Store
      </h1>

      <div className="flex flex-col gap-8 max-w-2xl">
        {/* ── ADD ── */}
        <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-sm text-gray-400 uppercase tracking-widest mb-4">
            Add Record
          </h2>
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-indigo-500 transition"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-indigo-500 transition"
            />
            <button
              onClick={storeData}
              className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all duration-150 text-white font-semibold px-6 py-2 rounded-lg text-sm"
            >
              Store Data
            </button>
          </div>
        </section>

        {/* ── FETCH ── */}
        <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-sm text-gray-400 uppercase tracking-widest mb-4">
            Fetch All Records
          </h2>
          <button
            onClick={fetchData}
            className="bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all duration-150 text-white font-semibold px-6 py-2 rounded-lg text-sm"
          >
            Fetch Data
          </button>
        </section>

        {/* ── UPDATE / DELETE ── */}
        <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <h2 className="text-sm text-gray-400 uppercase tracking-widest mb-4">
            Update / Delete by ID
          </h2>
          <div className="flex flex-col gap-3">
            <input
              type="number"
              placeholder="Record ID"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-amber-500 transition"
            />
            <input
              type="text"
              placeholder="New Name (for update only)"
              value={updateName}
              onChange={(e) => setUpdateName(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm outline-none focus:border-amber-500 transition"
            />
            <div className="flex gap-3">
              <button
                onClick={updateData}
                className="flex-1 bg-amber-600 hover:bg-amber-500 active:scale-95 transition-all duration-150 text-white font-semibold px-6 py-2 rounded-lg text-sm"
              >
                Update Data
              </button>
              <button
                onClick={deleteData}
                className="flex-1 bg-red-700 hover:bg-red-600 active:scale-95 transition-all duration-150 text-white font-semibold px-6 py-2 rounded-lg text-sm"
              >
                Delete Data
              </button>
            </div>
          </div>
        </section>

        {/* ── LOGS ── */}
        {logs.length > 0 && (
          <section className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h2 className="text-sm text-gray-400 uppercase tracking-widest mb-4">
              Activity Log
            </h2>
            <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto">
              {logs.map((log, i) => (
                <li
                  key={i}
                  className={`text-xs flex gap-3 items-start ${
                    log.type === "success"
                      ? "text-green-400"
                      : log.type === "error"
                      ? "text-red-400"
                      : "text-gray-400"
                  }`}
                >
                  <span className="text-gray-600 shrink-0">{log.time}</span>
                  <span>{log.msg}</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>

      <ToastContainer
        position="bottom-right"
        theme="dark"
        autoClose={2500}
        hideProgressBar={false}
      />
    </div>
  );
};

export default CrudForm;