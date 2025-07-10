import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const partners = [
  { name: 'EcoRetail', type: 'Retailer', logo: 'ER' },
  { name: 'GreenCycle', type: 'NGO', logo: 'GC' },
  { name: 'Sustainable Goods', type: 'Retailer', logo: 'SG' },
  { name: 'Earth Warriors', type: 'NGO', logo: 'EW' },
  { name: 'Circular Fashion', type: 'Retailer', logo: 'CF' },
  { name: 'ReNew Foundation', type: 'NGO', logo: 'RF' },
];

export default function Partners() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Trusted Partners</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join leading retailers, NGOs, and recyclers in the circular economy movement
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {partners.map((partner, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <span className="font-bold text-primary">{partner.logo}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold">{partner.name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {partner.type}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">Ready to Join Our Network?</h3>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Whether you're a retailer, NGO, or recycler, ReLoop provides the tools and connections 
              you need to make a positive impact.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge variant="outline" className="px-4 py-2">
                Retailers: List returned items
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                NGOs: Receive donations
              </Badge>
              <Badge variant="outline" className="px-4 py-2">
                Recyclers: Process materials
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}