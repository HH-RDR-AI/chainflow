"use client";

import {
  ChangeEventHandler,
  FC,
  MouseEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";
import Modeler from "@/src/components/Modeler";
import styles from "./ModelerPage.module.scss";
import {
  FaCheckToSlot,
  FaCross,
  FaDownload,
  FaFile,
  FaRegFolderOpen,
  FaUpload,
  FaXmark,
} from "react-icons/fa6";
import BpmnModeler from "camunda-bpmn-js/lib/camunda-platform/Modeler";
import clsx from "clsx";
import Button from "../Button";
import List from "../List";
import { getDefinitionXML, getDefinitions } from "@/src/utils/processUtils";
import { ProcessDefinition } from "@/app/processes/types";
import Viewer from "../Viewer";

const ModelerPage: FC<{ className?: string }> = ({ className }) => {
  const refFile = useRef<HTMLInputElement>(null);
  const refDialog = useRef<HTMLDialogElement>(null);
  const refModeler = useRef<BpmnModeler | null>(null);

  const [definitions, setDefinitions] = useState<ProcessDefinition[]>([]);

  useEffect(() => {
    //
  }, []);

  const importXML = async (xml: string) => {
    await refModeler.current?.importXML(xml);
    const canvas = refModeler.current?.get("canvas") as any;
    canvas?.zoom("fit-viewport");
  };

  const handleOpenFile: ChangeEventHandler<HTMLInputElement> = (e) => {
    e.preventDefault();

    if (!e.target?.files?.length) {
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const xml = e.target?.result;
      importXML(xml?.toString() || "");
    };

    reader.readAsText(e.target.files[0]);
  };

  const handleOpenFileClick: MouseEventHandler = (e) => {
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

  const handleOpenDefinitionClick = () => {
    refDialog.current?.showModal();

    const getData = async () => {
      const defs = await getDefinitions();
      setDefinitions(defs);
    };

    getData();
  };

  const handleCloseDialogClick = () => {
    refDialog.current?.close();
  };

  const loadXML = async (id: string) => {
    const xml = await getDefinitionXML(id);
    importXML(xml);
    handleCloseDialogClick();
  };

  const handleDeploy = () => {
    if (typeof window === "undefined") {
      return;
    }

    const name = window?.prompt("Enter deployment name", "random name") || "";

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

      const res = await fetch("api/engine/deployment/create", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        console.log(`Failed to deploy data: ${res.statusText} [${res.status}]`);
      }
    });
  };

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.header}>
        <h1 className={styles.title}>Modeler</h1>
        <div className={styles.tools}>
          <input
            ref={refFile}
            type="file"
            onChange={handleOpenFile}
            accept=".bpmn, .xml"
            className={styles.file}
          />
          <Button
            icon={<FaFile />}
            onClick={() => {
              refModeler.current?.createDiagram();
            }}
            className={styles.toolsAction}
          />

          <Button
            icon={<FaRegFolderOpen />}
            onClick={handleOpenFileClick}
            className={styles.toolsAction}
          />

          <Button
            icon={<FaUpload />}
            onClick={handleOpenDefinitionClick}
            className={styles.toolsAction}
          />

          <Button
            icon={<FaDownload />}
            onClick={handleDownload}
            className={styles.toolsAction}
          />

          <Button
            icon={<FaCheckToSlot />}
            className={styles.toolsAction}
            onClick={handleDeploy}
          />

          <dialog ref={refDialog} className={styles.modal}>
            <Button
              size="xs"
              icon={<FaXmark />}
              className={styles.modalClose}
              onClick={handleCloseDialogClick}
            />
            <h2>Select definition</h2>
            <ul className={styles.definitions}>
              {definitions.map((def, idx) => (
                <li key={idx} className={styles.definitionsItem}>
                  <button
                    className={styles.definition}
                    onClick={() => {
                      loadXML(def.id);
                    }}
                  >
                    <strong className={styles.definitionTitle}>
                      {def.name}
                    </strong>
                    {
                      <Viewer
                        process={def.id}
                        className={styles.definitionView}
                      />
                    }
                  </button>
                </li>
              ))}
            </ul>
          </dialog>
        </div>
      </div>
      <div className={styles.body}>
        <Modeler onInit={handleInit} />
      </div>
    </div>
  );
};

export default ModelerPage;
