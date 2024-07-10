export const MakeCSV = (data: any) => {
  let output = "username,present_at";
  data.forEach((val: any) => {
    output += "\n";
    output += val.username;
    output += ",";
    output += val.present_at;
  });
  return new Blob([output], { type: "text/csv;charset=utf-8;" });
};
