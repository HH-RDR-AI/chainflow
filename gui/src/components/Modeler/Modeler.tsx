"use client";

import {
  FC,
  useRef,
  useEffect,
  ChangeEventHandler,
  MouseEventHandler,
} from "react";

import "camunda-bpmn-js/dist/assets/camunda-cloud-modeler.css";
import BpmnModeler from "camunda-bpmn-js/lib/camunda-cloud/Modeler";

import styles from "./Modeler.module.scss";
import {
  FaDownload,
  FaRegFolderOpen,
  FaCheckToSlot,
  FaFile,
} from "react-icons/fa6";

export const Modeler: FC = () => {
  const refCanvas = useRef<HTMLDivElement>(null);
  const refProps = useRef<HTMLDivElement>(null);
  const refFile = useRef<HTMLInputElement>(null);
  const refModeler = useRef<BpmnModeler | null>(null);

  useEffect(() => {
    if (!refCanvas.current || refModeler.current) {
      return;
    }

    const modeler = new BpmnModeler({
      container: refCanvas.current,
      propertiesPanel: {
        parent: refProps.current,
      },
    });

    modeler?.createDiagram();
    refModeler.current = modeler;
  }, [refCanvas]);

  const handleOpenFile: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();

    if (!e.target?.files?.length) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const xml = e.target?.result;
      refModeler.current?.importXML(xml?.toString() || "");
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
        <div className={styles.canvas} ref={refCanvas}></div>
        <div className={styles.properties} ref={refProps}></div>
      </div>
    </div>
  );
};
