import { Fragment } from "react";
import { ChartV2 } from "./charts/ChartV2";
import { ChartV3 } from "./charts/ChartV3";
import { ChartV4 } from "./charts/ChartV4";
import { ChartV5 } from "./charts/ChartV5";
import type {
  BodyChunk,
  ChartData,
} from "@/lib/transparencia/types";

type Props = {
  bodyChunks: ReadonlyArray<BodyChunk>;
  chartData: ChartData;
};

export function TransparenciaBody({ bodyChunks, chartData }: Props) {
  return (
    <div className="mt-12 max-w-3xl">
      {bodyChunks.map((chunk, i) => (
        <Fragment key={i}>
          <div dangerouslySetInnerHTML={{ __html: chunk.html }} />
          {chunk.chartAfter === "V2" && <ChartV2 {...chartData.v2} />}
          {chunk.chartAfter === "V3" && <ChartV3 {...chartData.v3} />}
          {chunk.chartAfter === "V4" && <ChartV4 {...chartData.v4} />}
          {chunk.chartAfter === "V5" && <ChartV5 {...chartData.v5} />}
        </Fragment>
      ))}
    </div>
  );
}
