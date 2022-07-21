import { Component, OnInit } from '@angular/core';
import { Chain } from "../../model/chain";
import { HighlightService } from "../../service/highlight.service";
import { HttpClient } from "@angular/common/http";
import { ChainService } from "../../service/chain.service";

@Component({
  selector: 'app-installation-data',
  templateUrl: './installation-scripts.component.html',
  styleUrls: ['./installation-scripts.component.css']
})
export class InstallationScriptsComponent implements OnInit {

  automaticScriptUrl?: string;
  manualScriptContent?: string;
  testnetInstructionsContent?: string;
  chain?: Chain;
  highlighted = false;

  constructor(private highlightService: HighlightService,
              private http: HttpClient,
              public chainService: ChainService) {
  }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.chain = this.chainService.activeChain;
    if (this.chain) {

      const chainNet = this.chain.isTestnet ? "testnet" : "mainnet"
      const chainName = this.chain.chainName.toLowerCase()
      const chainId = this.chain.chainId
      this.automaticScriptUrl = `https://raw.githubusercontent.com/nodejumper-org/cosmos-utils/dev/${chainNet}/${chainName}/${chainId}-install.sh`

      this.http.get(this.automaticScriptUrl, {responseType: 'text'}).subscribe(data => {
        this.manualScriptContent = "NODE_MONIKER=<YOUR_NODE_MONIKER>\n\n"
          .concat(
            data
              .split("\nsleep 1\n")[1]
              .split("printLine")[0]
              .split("\n")
              .filter(line => !line.includes("print"))
              .join('\n')
              .replace(new RegExp('\\$CHAIN_ID', 'g'), chainId)
              .trim()
          )
          .replace("\n\n\n", "\n\n")
      });

      if (this.chain.isTestnet) {
        const testnetInstructionsUrl = `https://raw.githubusercontent.com/nodejumper-org/cosmos-utils/dev/testnet/${chainName}/testnet-instructions.sh`
        this.http.get(testnetInstructionsUrl, {responseType: 'text'}).subscribe(data => {
          this.testnetInstructionsContent = data?.trim() || 'TBD';
        });
      }
    }
  }

  ngAfterViewChecked() {
    if (this.manualScriptContent && !this.highlighted) {
      this.highlightService.highlightAll();
      this.highlighted = true;
    }
  }
}
