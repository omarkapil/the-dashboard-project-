import subprocess
import logging
import json
import asyncio
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from app.models.scan import Target

logger = logging.getLogger(__name__)

class DiscoveryAgent:
    """
    Agent responsible for Asset Discovery (EASM).
    Uses tools like subfinder to discover subdomains.
    """

    def __init__(self, db: Session):
        self.db = db

    async def discover_subdomains(self, domain: str) -> List[str]:
        """
        Run subfinder to discover subdomains for a given domain.
        """
        logger.info(f"Starting subdomain discovery for: {domain}")
        
        try:
            # Run subfinder
            # -d: domain
            # -silent: only output subdomains
            # -all: use all sources
            cmd = ["subfinder", "-d", domain, "-silent", "-all"]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            stdout, stderr = await process.communicate()
            
            if process.returncode != 0:
                logger.error(f"Subfinder failed: {stderr.decode()}")
                return []
                
            subdomains = stdout.decode().strip().split('\n')
            # Filter empty strings and remove duplicates
            subdomains = list(set([s.strip() for s in subdomains if s.strip()]))
            
            logger.info(f"Discovered {len(subdomains)} subdomains for {domain}")
            return subdomains
            
        except FileNotFoundError:
            logger.error("Subfinder binary not found. Please install proper dependencies.")
            return []
        except Exception as e:
            logger.error(f"Discovery failed: {str(e)}")
            return []

    async def process_discovery(self, domain: str, source: str = "discovery") -> Dict[str, Any]:
        """
        Main entry point: Discover assets and save them to DB as Targets.
        """
        subdomains = await self.discover_subdomains(domain)
        
        created_targets = []
        existing_targets = []
        
        for subdomain in subdomains:
            # Check if target already exists
            exists = self.db.query(Target).filter(Target.base_url.like(f"%{subdomain}%")).first()
            if exists:
                existing_targets.append(subdomain)
                continue
                
            # Create new Target
            new_target = Target(
                name=subdomain,
                base_url=f"https://{subdomain}", # Assume HTTPS for now
                source=source,
                tech_stack={}  # Will be populated by ReconAgent later
            )
            self.db.add(new_target)
            created_targets.append(subdomain)
            
        self.db.commit()
        
        return {
            "domain": domain,
            "total_found": len(subdomains),
            "new_targets_created": len(created_targets),
            "new_targets": created_targets
        }
