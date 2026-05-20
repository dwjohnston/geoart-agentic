import type React from "react";

type Props = {
	renderControlNodes: () => React.ReactNode;
};

export function Controls({ renderControlNodes }: Props) {
	return <>{renderControlNodes()}</>;
}
