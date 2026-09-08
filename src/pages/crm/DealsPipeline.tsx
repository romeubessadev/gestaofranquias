import { Button, PageHeader } from "@/components/ui";
import { Icon, crmIcons } from "./Icons";
import { PipelineBoard, PipelineStageStrip } from "./PipelineBoard";

export function DealsPipeline() {
  return (
    <div>
      <PageHeader
        title="Deals Pipeline"
        subtitle="182 deals · $1.24M total value"
        actions={<Button icon={<Icon d={crmIcons.plus} size={14} />}>New deal</Button>}
      />

      <div className="mb-4">
        <PipelineStageStrip />
      </div>

      <PipelineBoard />
    </div>
  );
}
