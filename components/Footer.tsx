import { Card } from"@/components/ui/card";
import { Button } from"@/components/ui/button";
import { ExternalLink } from"lucide-react";

export default function Footer() {
 return (
 <footer className="mt-auto border-t bg-white">
 <div className="container mx-auto px-4 py-6">
 <Card className="border-0 shadow-none bg-transparent">
 <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-gray-600">
 <div className="flex items-center gap-1">
 <span>Built with love by </span>
 <Button
 variant="link"
 className="ml-1 p-0 h-auto font-medium text-blue-600 hover:text-blue-800"
 asChild
 >
 <a
 href="https://www.linkedin.com/in/randalf"
 target="_blank"
 rel="noopener noreferrer"
 className="flex items-center gap-1"
 >
 Randalf
 <ExternalLink className="h-3 w-3" />
 </a>
 </Button>
 </div>
 </div>
 </Card>
 </div>
 </footer>
 );
}