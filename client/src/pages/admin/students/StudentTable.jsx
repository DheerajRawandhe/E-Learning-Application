import React from "react";
import { Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const oices = [
  {
    oice: "001",
    paymentStatus: "Nihal",
    totalAmount: "Nihal@gmail.com",
    paymentMethod: "JavaScript",
  },
  {
    oice: "   002",
    paymentStatus: "Ayush",
    totalAmount: "Ayush@gmail.com",
    paymentMethod: "Python",
  },
  {
    oice: "   003",
    paymentStatus: "Dheeraj",
    totalAmount: "Dheeraj@gmail.com",
    paymentMethod: "Full-Stack-Development",
  },
  {
    oice: "   004",
    paymentStatus: "Rohan",
    totalAmount: "Rohan@gmail.com",
    paymentMethod: "JavaScript",
  },
  {
    oice: "   005",
    paymentStatus: "Vinay",
    totalAmount: "Vinay@gmail.com",
    paymentMethod: "Python",
  },
  {
    oice: "   006",
    paymentStatus: "Rohit",
    totalAmount: "Rohit@gmail.com",
    paymentMethod: "Full-Stack-Development",
  },
  {
    oice: "   007",
    paymentStatus: "Neha",
    totalAmount: "Neha@gmail.com",
    paymentMethod: "JavaScript",
  },
];

export const StudentTable = () => {
  return (
    <>
      <div>StudentTable</div>
      <Table>
        <TableCaption>A list of your recent Students.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">No</TableHead>
            <TableHead>Student Name</TableHead>
            <TableHead>Course Name </TableHead>
            <TableHead className="text-right">Email Address</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {oices.map((oice) => (
            <TableRow key={oice.oice}>
              <TableCell className="font-medium">{oice.oice}</TableCell>
              <TableCell>{oice.paymentStatus}</TableCell>
              <TableCell>{oice.paymentMethod}</TableCell>
              <TableCell className="text-right">{oice.totalAmount}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            {/* <TableCell colSpan={3}>Total</TableCell>
            <TableCell className="text-right">$2,500@gmail.com</TableCell> */}
          </TableRow>
        </TableFooter>
      </Table>
    </>
  );
};

export default StudentTable;
