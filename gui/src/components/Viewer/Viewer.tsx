"use client";

import { FC, useRef, useEffect } from "react";

import BpmnViewer from "bpmn-js/lib/Viewer";

import styles from "./Viewer.module.scss";
import clsx from "clsx";
import { fetchEngine, getDefinitionXML } from "@/src/utils/processUtils";

export const Viewer: FC<{ process: string; className?: string }> = ({
  process,
  className,
}) => {
  const refCanvas = useRef<HTMLDivElement>(null);
  const refViewer = useRef<BpmnViewer | null>(null);

  useEffect(() => {
    if (!refCanvas.current || refViewer.current) {
      return;
    }

    const viewer = new BpmnViewer({
      container: refCanvas.current || "",
    });
    refViewer.current = viewer;

    const getXml = async () => {
      try {
        const xml = await getDefinitionXML(process);

        await viewer?.importXML(xml);
        const canvas = viewer.get("canvas") as any;
        canvas.zoom("fit-viewport");
      } catch (e) {
        console.error(e);
      }
    };

    getXml();
  }, [refCanvas]);

  return (
    <div
      className={clsx("bjs-viewer", styles.container, className)}
      ref={refCanvas}
    />
  );
};
