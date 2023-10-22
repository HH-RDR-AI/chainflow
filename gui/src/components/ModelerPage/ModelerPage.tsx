"use client";

import {
  ChangeEventHandler,
  FC,
  MouseEventHandler,
  useEffect,
  useRef,
} from "react";
import Modeler from "@/src/components/Modeler";
import styles from "./ModelerPage.module.scss";
import {
  FaCheckToSlot,
  FaDownload,
  FaFile,
  FaRegFolderOpen,
} from "react-icons/fa6";
import BpmnModeler from "camunda-bpmn-js/lib/camunda-platform/Modeler";
import clsx from "clsx";

const ModelerPage: FC<{ className?: string }> = ({ className }) => {
  const refFile = useRef<HTMLInputElement>(null);
  const refModeler = useRef<BpmnModeler | null>(null);

  useEffect(() => {
    //
  }, []);

  const handleOpenFile: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();

    if (!e.target?.files?.length) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const xml = e.target?.result;
      await refModeler.current?.importXML(xml?.toString() || "");
      const canvas = refModeler.current?.get("canvas") as any;
      canvas?.zoom("fit-viewport");
    };

    reader.readAsText(e.target.files[0]);
  };

  const handleOpenClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    refFile.current?.click();
  };

  const handleDownload = () => {
    refModeler.current?.saveXML().then((xmlResult) => {
      const element = document.createElement("a");
      const file = new Blob([xmlResult.xml || ""], {
        type: "application/xml",
      });
      element.href = URL.createObjectURL(file);
      element.download = "model.bpmn";
      document.body.appendChild(element); // Required for this to work in FireFox
      element.click();
    });
  };

  const handleInit = (modeler: BpmnModeler | null) => {
    refModeler.current = modeler;
  };

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.header}>
        <h2 className={styles.title}>Modeler</h2>
        <div className={styles.tools}>
          <input
            ref={refFile}
            type="file"
            onChange={handleOpenFile}
            accept=".bpmn, .xml"
            className={styles.file}
          />
          <button
            onClick={() => {
              refModeler.current?.createDiagram();
            }}
            className={styles.toolsAction}
          >
            <FaFile />
          </button>
          <button onClick={handleOpenClick} className={styles.toolsAction}>
            <FaRegFolderOpen />
          </button>
          <button onClick={handleDownload} className={styles.toolsAction}>
            <FaDownload />
          </button>
          <button
            className={styles.toolsAction}
            onClick={() => {
              if (typeof window === "undefined") {
                return;
              }

              const name =
                window?.prompt("Enter deployment name", "random name") || "";

              if (!name?.trim()) {
                return;
              }

              refModeler.current?.saveXML().then(async (xmlResult) => {
                if (!xmlResult.xml) {
                  return;
                }

                const formData = new FormData();
                formData.append("process.bpmn", new Blob([xmlResult.xml]));
                formData.append("deployment-name", name);

                const res = await fetch(
                  "http://0.0.0.0:3000/dashboard/api/engine/deployment/create",
                  {
                    method: "POST",
                    body: formData,
                  }
                );

                if (!res.ok) {
                  console.log(
                    `Failed to deploy data: ${res.statusText} [${res.status}]`
                  );
                }
              });
            }}
          >
            <FaCheckToSlot />
          </button>
        </div>
      </div>
      <div className={styles.body}>
        <Modeler onInit={handleInit} />
      </div>
    </div>
  );
};

export default ModelerPage;