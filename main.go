package main

import (
	"fmt"
	"os/exec"

	"github.com/xuri/excelize/v2"
)

func main() {
	f := excelize.NewFile()
	defer func() {
		if err := f.Close(); err != nil {
			fmt.Println(err)
		}
	}()

	// Create three sheets as it demands
	if _, err := f.NewSheet("Sheet2"); err != nil {
		fmt.Println(err)
		return
	}

	if _, err := f.NewSheet("Sheet3"); err != nil {
		fmt.Println(err)
		return
	}

	// Set header for sheet1
	f.SetCellValue("Sheet1", "A1", "匯款戶名")
	f.SetCellValue("Sheet1", "B1", "金額")
	f.SetCellValue("Sheet1", "C1", "通匯代號")
	f.SetCellValue("Sheet1", "D1", "帳號")

	// Output xlsx file
	if err := f.SaveAs("./assets/temp.xlsx"); err != nil {
		fmt.Println(err)
	}

	// Compile TypeScript
	tscCmd := exec.Command("tsc")
	err := tscCmd.Run()
	if err != nil {
		fmt.Printf("Error running tsc: %s\n", err)
		return
	}

	// Run the compiled JavaScript with Node.js
	nodeCmd := exec.Command("node", "./src/ts/index.js")
	output, err := nodeCmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Error running node: %s\n", err)
	}

	fmt.Println(string(output))
}
