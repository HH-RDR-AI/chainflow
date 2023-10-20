"use client";

import { ChangeEventHandler, FC, MouseEventHandler, useRef } from "react";
import Modeler from "@/src/components/Modeler";
import styles from "./page.module.scss";
import {
  FaCheckToSlot,
  FaDownload,
  FaFile,
  FaRegFolderOpen,
} from "react-icons/fa6";
import BpmnModeler from "camunda-bpmn-js/lib/camunda-platform/Modeler";

const ModelerPage: FC = () => {
  const refFile = useRef<HTMLInputElement>(null);
  const refModeler = useRef<BpmnModeler | null>(null);

  const handleOpenFile: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();

    if (!e.target?.files?.length) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const xml = e.target?.result;
      await refModeler.current?.importXML(xml?.toString() || "");
      refModeler.current?.get("canvas").zoom("fit-viewport");
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
    <div className={styles.container}>
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
              refModeler.current?.saveXML().then((xml) => console.log(xml));
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
