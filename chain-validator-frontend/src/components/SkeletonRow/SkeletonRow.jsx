import React from "react";
import { TableRow, TableCell } from "@mui/material";
import { Skeleton } from "@mui/material";

const SkeletonRow = ({ columns }) => {
  return (
    <TableRow>
      {Array.from({ length: columns }).map((_, index) => (
        <TableCell key={index}>
          <Skeleton variant="text" width="80%" height={20} />
        </TableCell>
      ))}
    </TableRow>
  );
};

export default SkeletonRow;
