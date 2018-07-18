using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace ZSFundComponent.Entity.ResponseEntity
{
    public class CompanyInfo
    {
        public string id { get; set; }
        public string parentId { get; set; }
        public int unitType { get; set; }
        public bool enabled { get; set; }
        public string loginName { get; set; }
        public string displayName { get; set; }
        public string email { get; set; }
        public string officePhone { get; set; }
        public string mobile { get; set; }
        public string title { get; set; }
        public string department { get; set; }
    }
}
